// src/app/core/tax.service.ts

import { Injectable } from '@angular/core';
import { TaxpayerDetails } from '../models/tax.model';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class TaxService {
  constructor() {}

  calculateOldRegimeTax(data: TaxpayerDetails): number {
    const hraExemption = this.getHRAExemption(data);
    const taxableFoodCard = this.getTaxableFoodCard(data.foodCard || 0);

    const deductions = this.getDeductionBreakdown(data);

    const totalIncome =
      (data.salary || 0) + (data.spouseSupport ? data.spouseIncome || 0 : 0);

    const taxableIncome =
      totalIncome - hraExemption - deductions.totalDeductions + taxableFoodCard;

    return this.calculateOldTaxFromSlabs(taxableIncome);
  }

  calculateNewRegimeTax(data: TaxpayerDetails): number {
    return this.getTaxWithMarginalRelief(data.salary);
  }

  getHRAExemption(data: TaxpayerDetails): number {
    const basic = data.salary * (data.basicPercentage / 100);
    const hraReceived = data.hra;
    const rentExcess = data.rentPaid - 0.1 * basic;
    const metroLimit = data.isMetro ? 0.5 * basic : 0.4 * basic;

    return Math.max(0, Math.min(hraReceived, rentExcess, metroLimit));
  }

  private calculateOldTaxFromSlabs(income: number): number {
    const slabs = [
      { limit: 250000, rate: 0 },
      { limit: 250000, rate: 0.05 },
      { limit: 500000, rate: 0.2 },
      { limit: Infinity, rate: 0.3 },
    ];

    return this.calculateTax(income, slabs);
  }

  getNewRegimeTax(taxableIncome: number): number {
    if (taxableIncome <= 1200000) return 0;

    let tax = 0;

    if (taxableIncome <= 1600000) {
      tax += (taxableIncome - 1200000) * 0.15;
    } else if (taxableIncome <= 2000000) {
      tax += 400000 * 0.15;
      tax += (taxableIncome - 1600000) * 0.2;
    } else if (taxableIncome <= 2400000) {
      tax += 400000 * 0.15 + 400000 * 0.2;
      tax += (taxableIncome - 2000000) * 0.25;
    } else {
      tax += 400000 * 0.15 + 400000 * 0.2 + 400000 * 0.25;
      tax += (taxableIncome - 2400000) * 0.3;
    }

    return Math.round(tax);
  }

  getTaxWithMarginalRelief(taxableIncome: number): number {
    const slabTax = this.getNewRegimeTax(taxableIncome);
    if (taxableIncome <= 1200000) return 0;

    const excessIncome = taxableIncome - 1200000;
    return Math.min(slabTax, excessIncome); // marginal relief cap
  }

  private calculateTax(
    income: number,
    slabs: { limit: number; rate: number }[],
  ): number {
    let tax = 0;

    for (const slab of slabs) {
      if (income > slab.limit) {
        tax += slab.limit * slab.rate;
        income -= slab.limit;
      } else {
        tax += income * slab.rate;
        break;
      }
    }

    return tax * 1.04; // Include 4% cess
  }

  getSlabRate(taxableIncome: number): number {
    if (taxableIncome <= 250000) return 0;
    if (taxableIncome <= 500000) return 0.05;
    if (taxableIncome <= 1000000) return 0.2;
    return 0.3;
  }

  getTaxableFoodCard(foodCard: number): number {
    const maxExempt = 30000; // ₹2,500/month * 12
    return Math.max(0, foodCard - maxExempt);
  }

  getDeductionBreakdown(data: TaxpayerDetails) {
    const total80C = Math.min(150000, data.ppf + data.lic + data.pf);

    const parentLimit = data.parentsAbove60 ? 50000 : 25000;
    const total80D =
      Math.min(25000, data.healthInsuranceSelf) +
      Math.min(parentLimit, data.healthInsuranceParents);

    const npsDeduction = Math.min(50000, data.nps);

    // Section 24(b) – Home loan interest
    // 🧠 Home loan deduction
    let homeLoanDeduction = data.homeLoanInterest || 0;
    let jointDeduction = 0;

    if (data.spouseSupport) {
      jointDeduction = data.jointHomeLoanInterest || 0;
    }

    const totalHomeLoanDeduction = homeLoanDeduction + jointDeduction;

    // Cap house property loss setoff to ₹2L (applicable even if letout/vacant)
    const housePropertySetoff = Math.min(200000, totalHomeLoanDeduction);

    const totalDeductions =
      total80C + total80D + npsDeduction + housePropertySetoff;

    return {
      total80C,
      total80D,
      npsDeduction,
      homeLoanDeduction, // personal only
      jointHomeLoanDeduction: jointDeduction,
      housePropertySetoff,
      totalDeductions,
      remaining80C: 150000 - total80C,
      remaining80D: 25000 + parentLimit - total80D,
    };
  }
}

export function exportTaxHelperSheet(data: any) {
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([data]);
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Tax Summary': worksheet },
    SheetNames: ['Tax Summary'],
  };
  const excelBuffer: any = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });

  FileSaver.saveAs(blob, 'Tax-Filing-Helper.xlsx');
}

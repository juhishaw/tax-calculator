import { Injectable } from "@angular/core";
import { TaxpayerDetails } from "../models/tax.model";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TaxpayerDetailsService {
  private data: Partial<TaxpayerDetails> = {};
  public data$ = new BehaviorSubject<Partial<TaxpayerDetails>>({});

  setPartial(partial: Partial<TaxpayerDetails>) {
    this.data = { ...this.data, ...partial };
    this.data$.next(this.data);
  }

  getData(): Partial<TaxpayerDetails> {
    return this.data;
  }

  getFinal(): TaxpayerDetails {
    const d = this.data;
  
    return {
      // Income
      salary: d.salary || 0,
      basicPercentage: d.basicPercentage || 0,
      hra: d.hra || 0,
      rentPaid: d.rentPaid || 0,
      isMetro: d.isMetro || false,
      totalCTC: d.totalCTC || 0,
      basicCTC: d.basicCTC || 0,
      transportAllowance: d.transportAllowance || 0,
      useMonthly: d.useMonthly ?? true,
      monthlyGross: d.monthlyGross || 0,
      annualSalary: d.annualSalary || 0,
  
      // Reimbursements
      medicalAllowance: d.medicalAllowance || 0,
      medicalClaimed: d.medicalClaimed || 0,
      foodCard: d.foodCard || 0,
  
      // Section 80C
      ppf: d.ppf || 0,
      lic: d.lic || 0,
      pf: d.pf || 0,
      fd80C: d.fd80C || 0,
      fd5yr: d.fd5yr || 0,
      elss: d.elss || 0,
      nsc: d.nsc || 0,
      ulip: d.ulip || 0,
      sukanya: d.sukanya || 0,
      tuitionFees: d.tuitionFees || 0,
      housingPrincipal: d.housingPrincipal || 0,
      pension80C: d.pension80C || 0,
      pension80ccc: d.pension80ccc || 0,
  
      // Section 80D
      healthInsuranceSelf: d.healthInsuranceSelf || 0,
      healthInsuranceParents: d.healthInsuranceParents || 0,
      parentsAbove60: d.parentsAbove60 || false,
  
      // NPS
      nps: d.nps || 0,
  
      // Other Deductions
      educationLoanInterest: d.educationLoanInterest || 0,
      donations80G: d.donations80G || 0,
      savingsInterest: d.savingsInterest || 0,
      noHraRentPaid: d.noHraRentPaid || 0,
  
      // Disability
      disabilityClaimType: d.disabilityClaimType || 'none',
      disabilityPercentage: d.disabilityPercentage ?? null,
      disabilitySeverity: d.disabilitySeverity || 'normal',
      dependentDisabilityPercentage: d.dependentDisabilityPercentage ?? null,
      dependentSeverity: d.dependentSeverity || 'normal',
  
      // Advanced Medical
      section80ddb: d.section80ddb || 0,
      section80eeb: d.section80eeb || 0,
  
      // EV
      electricVehicleInterest: d.electricVehicleInterest || 0,
  
      // House
      homeLoanInterest: d.homeLoanInterest || 0,
      houseType: d.houseType || 'self',
  
      // Spouse
      spouseSupport: d.spouseSupport || false,
      spouseIncome: d.spouseIncome || 0,
      jointHomeLoanInterest: d.jointHomeLoanInterest || 0,
    };
  }
  

  clear() {
    this.data = {};
  }
}

import { Component, Input, OnInit } from "@angular/core";
import { TaxpayerDetails } from "src/app/models/tax.model";
import { TaxService } from "src/app/core/tax.service";
import { TaxpayerDetailsService } from "src/app/core/taxpayer-details.service";

@Component({
  selector: "app-investment-advice",
  templateUrl: "./investment-advice.component.html",
  styleUrls: ["./investment-advice.component.scss"],
})
export class InvestmentAdviceComponent implements OnInit {
  @Input() data?: Partial<TaxpayerDetails>;
  groupedAdvice: {
    [key: string]: { suggestion: string; remaining: number }[];
  } = {};
  projectedTaxSaved = 0;

  constructor(
    private taxService: TaxService,
    private taxpayerService: TaxpayerDetailsService
  ) {}

  ngOnInit(): void {
    if (!this.data) {
      this.data = this.taxpayerService.getData();
    }
    this.buildAdvice();
  }

  buildAdvice(): void {
    const d = this.data!;
    const slabRate = this.taxService.getSlabRate(
      (d.salary || 0) - this.getTotalUsed()
    );
    this.groupedAdvice = {};
    this.projectedTaxSaved = 0;

    const push = (section: string, suggestion: string, remaining: number) => {
      if (!this.groupedAdvice[section]) this.groupedAdvice[section] = [];
      this.groupedAdvice[section].push({ suggestion, remaining });
      this.projectedTaxSaved += remaining * slabRate;
    };

    // --- 80C
    const used80C = Math.min(
      150000,
      (d.ppf || 0) +
        (d.lic || 0) +
        (d.pf || 0) +
        (d.fd80C || 0) +
        (d.fd5yr || 0) +
        (d.elss || 0) +
        (d.nsc || 0) +
        (d.ulip || 0) +
        (d.sukanya || 0) +
        (d.tuitionFees || 0) +
        (d.housingPrincipal || 0) +
        (d.pension80C || 0)
    );
    const rem80C = 150000 - used80C;
    if (rem80C > 0) {
      push("80C", `Invest ₹${rem80C} in ELSS, PPF, etc.`, rem80C);
    }

    // --- 80D
    const parentLimit = d.parentsAbove60 ? 50000 : 25000;
    const used80D =
      Math.min(25000, d.healthInsuranceSelf || 0) +
      Math.min(parentLimit, d.healthInsuranceParents || 0);
    const rem80D = 25000 + parentLimit - used80D;
    if (rem80D > 0) {
      push("80D", `Top-up medical insurance by ₹${rem80D}`, rem80D);
    }

    // --- 80CCD(1B)
    const usedNPS = Math.min(50000, d.nps || 0);
    if (usedNPS < 50000) {
      push(
        "80CCD(1B)",
        `Contribute ₹${50000 - usedNPS} to NPS`,
        50000 - usedNPS
      );
    }

    // --- Disability
    if (d.disabilityClaimType === "self") {
      const cap = d.disabilitySeverity === "severe" ? 125000 : 75000;
      push("80U", `Claim ₹${cap} as self-disability deduction`, cap);
    }

    if (d.disabilityClaimType === "dependent") {
      const cap = d.dependentSeverity === "severe" ? 125000 : 75000;
      push("80DD", `Claim ₹${cap} for dependent disability`, cap);
    }

    // --- 80DDB (Critical Illness)
    if ((d.section80ddb || 0) === 0) {
      push("80DDB", "Claim deduction for critical illness if eligible", 40000);
    }

    // --- 80EEB (EV Loan Interest)
    const evInterest = d.electricVehicleInterest || 0;
    if ((d.section80eeb || 0) === 0 && evInterest > 0) {
      push("80EEB", `Claim ₹${evInterest} for EV loan`, evInterest);
    }

    // --- Medical Allowance
    const unclaimedMed = (d.medicalAllowance || 0) - (d.medicalClaimed || 0);
    if (unclaimedMed > 0) {
      push(
        "Medical Allowance",
        `⚠️ Unclaimed ₹${unclaimedMed} medical reimbursement`,
        unclaimedMed
      );
    }

    // --- No Advice?
    if (Object.keys(this.groupedAdvice).length === 0) {
      this.groupedAdvice["🎉"] = [
        {
          suggestion: `You've maxed out your deductions. Sit back and relax.`,
          remaining: 0,
        },
      ];
    }
  }

  private getTotalUsed(): number {
    const d = this.data!;
    return (
      Math.min(150000, (d.ppf || 0) + (d.lic || 0) + (d.pf || 0)) +
      Math.min(25000, d.healthInsuranceSelf || 0) +
      Math.min(50000, d.nps || 0)
    );
  }

  get adviceSections(): string[] {
    return Object.keys(this.groupedAdvice);
  }
}

import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { TaxpayerDetails } from "src/app/models/tax.model";

@Component({
  selector: "app-audit-risk-tips",
  templateUrl: "./audit-risk-tips.component.html",
  styleUrls: ["./audit-risk-tips.component.scss"],
})
export class AuditRiskTipsComponent implements OnChanges {
  @Input() data!: TaxpayerDetails;
  @Input() deductions!: {
    remaining80C: number;
    remaining80D: number;
    npsDeduction: number;
  };

  tips: { message: string; level: "low" | "medium" | "high" }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (this.data && this.deductions) {
      this.buildTips();
    }
  }

  buildTips(): void {
    this.tips = [];

    const d = this.data;

    // 💸 High Donations
    if (d.donations80G > 50000) {
      this.tips.push({
        message: "High donations under 80G. Retain donation receipts.",
        level: "medium",
      });
    }

    // ♿ Disability (Self)
    if (d.disabilityClaimType === "self") {
      this.tips.push({
        message: "80U Disability claimed. Keep certified medical proof.",
        level: "high",
      });
    }

    // ♿ Disability (Dependent)
    if (d.disabilityClaimType === "dependent") {
      this.tips.push({
        message:
          "80DD Dependent disability claimed. Proof of expense required.",
        level: "high",
      });
    }

    // 📄 Full Utilization of Major Deductions
    if (
      this.deductions.remaining80C === 0 &&
      this.deductions.remaining80D === 0 &&
      this.deductions.npsDeduction === 50000
    ) {
      this.tips.push({
        message:
          "All major deductions (80C, 80D, NPS) fully claimed. Maintain documentation.",
        level: "low",
      });
    }

    // 🏠 Joint Home Loan
    if (d.spouseSupport && d.jointHomeLoanInterest > 0) {
      this.tips.push({
        message:
          "Joint home loan interest claimed. Co-ownership documents needed.",
        level: "medium",
      });
    }

    // 🧾 Unclaimed Medical Allowance
    const unclaimedMed = (d.medicalAllowance || 0) - (d.medicalClaimed || 0);
    if (d.medicalAllowance > 0 && unclaimedMed > 0) {
      this.tips.push({
        message: `₹${unclaimedMed} medical allowance unclaimed. May cause Form-16 mismatch.`,
        level: "low",
      });
    }

    // 🎯 EV Loan Not Claimed
    if ((d.electricVehicleInterest || 0) > 0 && (d.section80eeb || 0) === 0) {
      this.tips.push({
        message: "EV loan interest (80EEB) not claimed. Missed benefit risk.",
        level: "low",
      });
    }

    // 💰 Suspicious Savings Interest
    if ((d.savingsInterest || 0) > 10000) {
      this.tips.push({
        message: "80TTA exceeds ₹10,000. Verify if correct section claimed.",
        level: "medium",
      });
    }
  }
}

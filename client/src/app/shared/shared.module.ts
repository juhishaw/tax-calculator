import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeductionSummaryComponent } from './components/deduction-summary/deduction-summary.component';
import { MaterialModule } from './material/material.module';
import { InvestmentAdviceComponent } from './components/investment-advice/investment-advice.component';
import { TaxPolicyTableComponent } from './tax-policy-table/tax-policy-table.component';
import { TaxPreviewWidgetComponent } from './tax-preview-widget/tax-preview-widget.component';
import { SuggestionsFooterComponent } from './suggestions-footer/suggestions-footer.component';
import { AuditRiskTipsComponent } from './audit-risk-tips/audit-risk-tips.component';
import { PayslipPreviewModalComponent } from './payslip-preview-modal/payslip-preview-modal.component';

@NgModule({
  declarations: [
    DeductionSummaryComponent,
    InvestmentAdviceComponent,
    TaxPolicyTableComponent,
    TaxPreviewWidgetComponent,
    SuggestionsFooterComponent,
    AuditRiskTipsComponent,
    PayslipPreviewModalComponent
  ],
  imports: [CommonModule, MaterialModule],
  exports: [
    DeductionSummaryComponent,
    InvestmentAdviceComponent,
    TaxPolicyTableComponent,
    TaxPreviewWidgetComponent,
    SuggestionsFooterComponent,
    AuditRiskTipsComponent,
    PayslipPreviewModalComponent
  ],
})
export class SharedModule {}

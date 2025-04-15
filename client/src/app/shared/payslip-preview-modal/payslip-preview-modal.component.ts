import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SafeResourceUrl, DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-payslip-preview-modal",
  templateUrl: "./payslip-preview-modal.component.html",
  styleUrls: ["./payslip-preview-modal.component.scss"],
})
export class PayslipPreviewModalComponent {
  safeUrl: SafeResourceUrl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { fileUrl: string; fileType: string },
    private sanitizer: DomSanitizer
  ) {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.fileUrl);
  }
}

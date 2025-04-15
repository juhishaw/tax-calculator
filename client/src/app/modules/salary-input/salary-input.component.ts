import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { TaxpayerDetailsService } from "src/app/core/taxpayer-details.service";
import { TaxPreviewService } from "src/app/core/tax-preview.service";
import { TaxUtilsService } from "src/app/utils/tax-utils.service";
import { MatDialog } from "@angular/material/dialog";
import { PayslipPreviewModalComponent } from "src/app/shared/payslip-preview-modal/payslip-preview-modal.component";

@Component({
  selector: "app-salary-input",
  templateUrl: "./salary-input.component.html",
  styleUrls: ["./salary-input.component.scss"],
})
export class SalaryInputComponent implements OnInit {
  form!: FormGroup;
  calculatedBasicPercentage = 0;
  payslipMeta: { pan?: string; uan?: string } | null = null;
  selectedFile: File | null = null;
  filePreviewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private taxpayerService: TaxpayerDetailsService,
    private taxPreview: TaxPreviewService,
    public taxUtils: TaxUtilsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.createForm();
    const saved = this.taxpayerService.getData();
    this.form.patchValue(saved);
    this.updateBasicPercentage();

    this.form.valueChanges.subscribe(() => {
      this.updateBasicPercentage();
      this.taxPreview.updateFormPartials(this.form.getRawValue());
    });
  }

  createForm(): void {
    this.form = this.fb.group({
      totalCTC: [null],
      basicCTC: [null],
      hra: [null],
      pf: [null],
      transportAllowance: [null],
      medicalAllowance: [null],
      medicalClaimed: [null],
      foodCard: [3000 * 12],
      useMonthly: [true],
      monthlyGross: [null],
      annualSalary: [null],
      rentPaid: [null],
      isMetro: [false],
    });
  }

  updateBasicPercentage(): void {
    const basic = this.form.get("basicCTC")?.value || 0;
    const total = this.form.get("totalCTC")?.value || 0;
    this.calculatedBasicPercentage =
      total > 0 ? Math.round((basic / total) * 100) : 0;
  }

  next(): void {
    const {
      monthlyGross,
      annualSalary,
      useMonthly,
      hra,
      pf,
      medicalAllowance,
      medicalClaimed,
      foodCard,
      rentPaid,
      isMetro,
    } = this.form.value;

    const salary = useMonthly ? monthlyGross * 12 : annualSalary;

    this.taxpayerService.setPartial({
      salary,
      basicPercentage: this.calculatedBasicPercentage,
      hra,
      pf,
      medicalAllowance,
      medicalClaimed,
      foodCard,
      rentPaid,
      isMetro,
    });

    this.router.navigate(["/deductions"]);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;
  
    this.selectedFile = file;
  
    const formData = new FormData();
    formData.append("payslip", file);
  
    // Preview URL
    this.filePreviewUrl = URL.createObjectURL(file);
  
    this.taxPreview.uploadPayslip(formData).subscribe((parsed: any) => {
      console.log(parsed)
      const { pan, uan, ...formPatch } = parsed;
      this.payslipMeta = { pan, uan };
      this.form.patchValue(formPatch);
    });
  }

  openPreviewModal(): void {
    if (!this.filePreviewUrl || !this.selectedFile) return;
  
    this.dialog.open(PayslipPreviewModalComponent, {
      width: '80%',
      maxHeight: '90vh',
      data: {
        fileUrl: this.filePreviewUrl,
        fileType: this.selectedFile.type,
      }
    });
  }
}

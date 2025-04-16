import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { TaxpayerDetailsService } from "src/app/core/taxpayer-details.service";
import { TaxPreviewService } from "src/app/core/tax-preview.service";
import { TaxUtilsService } from "src/app/utils/tax-utils.service";
import { MatDialog } from "@angular/material/dialog";
import { PayslipPreviewModalComponent } from "src/app/shared/payslip-preview-modal/payslip-preview-modal.component";

interface PayslipParsedResponse {
  pan?: string | null;
  uan?: string | null;
  [key: string]: any;
}

@Component({
  selector: "app-salary-input",
  templateUrl: "./salary-input.component.html",
  styleUrls: ["./salary-input.component.scss"],
})
export class SalaryInputComponent implements OnInit {
  form!: FormGroup;
  calculatedBasicPercentage = 0;
  selectedFile: File | null = null;
  filePreviewUrl: string | null = null;
  isUploading = false;
  payslipMeta: { pan?: string; uan?: string } = {};
  originalBasicValue: number | null = null;
  originalHraValue: number | null = null;

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

    if (saved) {
      this.payslipMeta = {
        pan: saved.pan ?? undefined,
        uan: saved.uan ?? undefined,
      };

      if (saved.payslipPreviewUrl) {
        this.filePreviewUrl = saved.payslipPreviewUrl;
      }

      const isMonthly = saved.hraIsMonthly ?? true;
      const hraNormalized = isMonthly ?  (saved.hra || 0) / 12 : saved.hra;
      this.originalHraValue = hraNormalized || 0;
      
      const basicIsMonthly = saved.basicIsMonthly ?? true;
      const basicNormalized = basicIsMonthly ? saved.basicCTC : (saved.basicCTC || 0) / 12;
      this.originalBasicValue = basicNormalized || 0;
      
      this.form.patchValue({
        ...saved,
        hra: hraNormalized,
        basicCTC: basicNormalized,
      });

      console.log(isMonthly, this.originalHraValue)

      // Prevent user from typing in Total CTC directly
      this.form.get("totalCTC")?.disable();
    }

    // Recompute totalCTC when gross salary changes or toggle flips
    this.form.get("useMonthly")?.valueChanges.subscribe(() => {
      this.updateTotalCTC();
    });

    this.form.get("monthlyGross")?.valueChanges.subscribe(() => {
      this.updateTotalCTC();
    });

    this.form.get("annualSalary")?.valueChanges.subscribe(() => {
      this.updateTotalCTC();
    });

    // Basic toggle listeners for unit conversion (existing)
    this.form
      .get("basicIsMonthly")
      ?.valueChanges.subscribe((isMonthly: boolean) => {
        if (this.originalBasicValue == null) return;
        const transformed = isMonthly
          ? this.originalBasicValue
          : this.originalBasicValue * 12;
        this.form.get("basicCTC")?.setValue(transformed, { emitEvent: false });
      });

    this.form.get("basicCTC")?.valueChanges.subscribe((val) => {
      const isMonthly = this.form.get("basicIsMonthly")?.value;
      if (val != null && this.originalBasicValue == null) {
        this.originalBasicValue = isMonthly ? val : val / 12;
      }
      this.updateBasicPercentage();
      this.taxPreview.updateFormPartials(this.form.getRawValue());
    });

    // HRA toggle sync
    this.form
      .get("hraIsMonthly")
      ?.valueChanges.subscribe((isMonthly: boolean) => {
        if (this.originalHraValue == null) return;
        const transformed = isMonthly
          ? this.originalHraValue
          : this.originalHraValue * 12;
        this.form.get("hra")?.setValue(transformed, { emitEvent: false });
      });

    this.form.get("hra")?.valueChanges.subscribe((val) => {
      const isMonthly = this.form.get("hraIsMonthly")?.value;
      if (val != null && this.originalHraValue == null) {
        this.originalHraValue = isMonthly ? val : val / 12;
      }
    });

    console.log(saved);
  }

  private updateTotalCTC(): void {
    const useMonthly = this.form.get("useMonthly")?.value;
    const monthly = this.form.get("monthlyGross")?.value;
    const annual = this.form.get("annualSalary")?.value;

    const derivedCTC = useMonthly ? monthly * 12 : annual;

    if (derivedCTC != null && !isNaN(derivedCTC)) {
      this.form.get("totalCTC")?.setValue(derivedCTC, { emitEvent: false });
    }
  }

  createForm(): void {
    this.form = this.fb.group({
      totalCTC: [null],
      basicCTC: [null],
      basicIsMonthly: [true],
      hraIsMonthly: [true],
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
    const raw = this.form.getRawValue();
    const salary = raw.useMonthly ? raw.monthlyGross * 12 : raw.annualSalary;
    const transformedHRA = raw.hraIsMonthly ? raw.hra * 12 : raw.hra;
    console.log(raw);
    this.taxpayerService.setPartial({
      salary,
      basicPercentage: this.calculatedBasicPercentage,
      hra: transformedHRA,
      hraIsMonthly: raw.hraIsMonthly,
      pf: raw.pf,
      medicalAllowance: raw.medicalAllowance,
      medicalClaimed: raw.medicalClaimed,
      foodCard: raw.foodCard,
      rentPaid: raw.rentPaid,
      isMetro: raw.isMetro,
      basicCTC: raw.basicCTC,
      basicIsMonthly: raw.basicIsMonthly,
      monthlyGross: raw.monthlyGross,
      annualSalary: raw.annualSalary,
      useMonthly: raw.useMonthly,
      totalCTC: raw.totalCTC, // ✅ Now this won't be undefined
      transportAllowance: raw.transportAllowance,
      pan: this.payslipMeta.pan,
      uan: this.payslipMeta.uan,
      payslipPreviewUrl: this.filePreviewUrl,
    });

    this.router.navigate(["/deductions"]);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    this.selectedFile = file;
    this.isUploading = true;

    const formData = new FormData();
    formData.append("payslip", file);
    this.filePreviewUrl = URL.createObjectURL(file);

    this.taxPreview.uploadPayslip(formData).subscribe({
      next: (data: PayslipParsedResponse) => {
        this.form.patchValue(data);

        // Save original for unit toggling
        this.originalBasicValue = data["basicCTC"] ?? null;
        if (data["hra"] != null) this.originalHraValue = data["hra"];

        // Populate PAN/UAN UI
        this.payslipMeta.pan = data.pan ?? undefined;
        this.payslipMeta.uan = data.uan ?? undefined;

        // ✅ Persist all relevant metadata
        this.taxpayerService.setPartial({
          payslipPreviewUrl: this.filePreviewUrl,
          pan: data.pan ?? undefined,
          uan: data.uan ?? undefined,
        });
      },
      error: (err) => console.error("Upload error", err),
      complete: () => (this.isUploading = false),
    });
  }

  openPreviewModal(): void {
    if (!this.filePreviewUrl || !this.selectedFile) return;

    this.dialog.open(PayslipPreviewModalComponent, {
      width: "80%",
      maxHeight: "90vh",
      data: {
        fileUrl: this.filePreviewUrl,
        fileType: this.selectedFile.type,
      },
    });
  }
}

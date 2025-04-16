import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { TaxpayerDetailsService } from "src/app/core/taxpayer-details.service";
import { TaxPreviewService } from "src/app/core/tax-preview.service";
import { TaxUtilsService } from "src/app/utils/tax-utils.service";
import { MatDialog } from "@angular/material/dialog";
import { PayslipPreviewModalComponent } from "src/app/shared/payslip-preview-modal/payslip-preview-modal.component";
import { HttpEventType, HttpResponse } from "@angular/common/http";

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
export class SalaryInputComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  calculatedBasicPercentage = 0;
  selectedFile: File | null = null;
  filePreviewUrl: string | null = null;
  isUploading = false;
  payslipMeta: { pan?: string; uan?: string } = {};
  originalBasicValue: number | null = null;
  originalHraValue: number | null = null;
  forceOCR = false;

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
    this.initializeFromSavedData();
    this.setupTotalCTCRecalculation();
    this.setupBasicCTCToggleSync();
    this.setupHRAToggleSync();
  }

  ngOnDestroy(): void {
    if (this.filePreviewUrl) {
      URL.revokeObjectURL(this.filePreviewUrl); // 🧼 Clean blob from memory
      this.filePreviewUrl = null;
    }

    // Optional: wipe out payslip blob metadata
    this.taxpayerService.setPartial({
      payslipPreviewUrl: null,
    });

    this.selectedFile = null;
    this.payslipMeta = {};
  }

  private initializeFromSavedData(): void {
    const saved = this.taxpayerService.getData();
    if (!saved) return;

    this.payslipMeta = {
      pan: saved.pan ?? undefined,
      uan: saved.uan ?? undefined,
    };

    if (saved.payslipPreviewUrl) {
      this.filePreviewUrl = saved.payslipPreviewUrl;
    }
    // ✅ Always assume saved.basicCTC is annual
    this.originalBasicValue = saved.basicCTC || 0;
    this.form.patchValue({
      basicIsMonthly: saved.basicIsMonthly ?? false,
      basicCTC: saved.basicCTC,
    });

    //HRA calculation
    const hraMonthly =
      saved.originalHraMonthly ??
      (saved.hraIsMonthly ? saved.hra ?? 0 : (saved.hra ?? 0) / 12);
    this.originalHraValue = hraMonthly;
    this.form.patchValue({
      hraIsMonthly: saved.hraIsMonthly ?? true,
      hra: saved.hraIsMonthly ? hraMonthly : hraMonthly * 12,
    });

    this.form.get("totalCTC")?.disable();
  }

  private setupTotalCTCRecalculation(): void {
    const recalc = () => this.updateTotalCTC();
    this.form.get("useMonthly")?.valueChanges.subscribe(recalc);
    this.form.get("monthlyGross")?.valueChanges.subscribe(recalc);
    this.form.get("annualSalary")?.valueChanges.subscribe(recalc);
  }

  private setupBasicCTCToggleSync(): void {
    this.form
      .get("basicIsMonthly")
      ?.valueChanges.subscribe((isMonthly: boolean) => {
        if (this.originalBasicValue == null) return;

        const basicCTC = this.form.get("basicCTC")?.value;
        if (basicCTC) {
          const transformed = isMonthly ? basicCTC / 12 : basicCTC * 12;
          this.form
            .get("basicCTC")
            ?.setValue(transformed, { emitEvent: false });
        }
      });

    this.form.get("basicCTC")?.valueChanges.subscribe((val) => {
      const isMonthly = this.form.get("basicIsMonthly")?.value;
      if (val != null && this.originalBasicValue === null) {
        this.originalBasicValue = isMonthly ? val : val / 12;
      }
      this.updateBasicPercentage();
      this.taxPreview.updateFormPartials(this.form.getRawValue());
    });
  }

  private setupHRAToggleSync(): void {
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
      if (val != null && this.originalHraValue === null) {
        this.originalHraValue = isMonthly ? val : val / 12;
      }
    });
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
      basicIsMonthly: [false],
      hraIsMonthly: [true],
      hra: [null],
      pf: [null],
      transportAllowance: [null],
      medicalAllowance: [null],
      medicalClaimed: [null],
      foodCard: [3000 * 12],
      useMonthly: [false],
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
    const salary = this.computeSalary(raw);
    const transformedHRA = this.computeHRA(raw);

    this.persistTaxpayerData(raw, salary, transformedHRA);
    this.router.navigate(["/deductions"]);
  }

  private computeSalary(raw: any): number {
    return raw.useMonthly ? raw.monthlyGross * 12 : raw.annualSalary;
  }

  private computeHRA(raw: any): number {
    return raw.hraIsMonthly ? raw.hra * 12 : raw.hra;
  }

  private persistTaxpayerData(raw: any, salary: number, hra: number): void {
    this.taxpayerService.setPartial({
      salary,
      basicPercentage: this.calculatedBasicPercentage,
      hra,
      hraIsMonthly: raw.hraIsMonthly,
      originalHraMonthly: this.originalHraValue || 0,
      pf: raw.pf,
      medicalAllowance: raw.medicalAllowance,
      medicalClaimed: raw.medicalClaimed,
      foodCard: raw.foodCard,
      rentPaid: raw.rentPaid,
      isMetro: raw.isMetro,
      basicCTC: raw.basicCTC,
      basicIsMonthly: raw.basicIsMonthly,
      originalBasicMonthly: this.originalBasicValue || 0,
      monthlyGross: raw.monthlyGross,
      annualSalary: raw.annualSalary,
      useMonthly: raw.useMonthly,
      totalCTC: raw.totalCTC,
      transportAllowance: raw.transportAllowance,
      pan: this.payslipMeta.pan,
      uan: this.payslipMeta.uan,
      payslipPreviewUrl: this.filePreviewUrl,
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("📁 File too large. Please upload a file under 2MB.");
      return;
    }

    if (!["application/pdf", "image/png", "image/jpeg"].includes(file.type)) {
      alert("Unsupported file type.");
      return;
    }

    this.prepareUpload(file);

    const formData = new FormData();
    formData.append("payslip", file);
    formData.append("forceOCR", String(this.forceOCR));
    this.taxPreview.uploadPayslip(formData).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          // You can show progress here if needed
          const progress = Math.round(
            (event.loaded / (event.total || 1)) * 100
          );
          console.log(`Upload progress: ${progress}%`);
        } else if (event instanceof HttpResponse) {
          const data = event.body as PayslipParsedResponse;
          this.handleUploadSuccess(data);
        }
      },
      error: (err) => console.error("Upload error", err),
      complete: () => (this.isUploading = false),
    });
  }

  private prepareUpload(file: File): void {
    this.selectedFile = file;
    this.filePreviewUrl = URL.createObjectURL(file);
    this.isUploading = true;
  }

  private handleUploadSuccess(data: PayslipParsedResponse): void {
    this.originalBasicValue = data["basicCTC"] ?? null;
    this.form.patchValue({
      ...data,
      basicCTC: this.form.get("basicIsMonthly")?.value
        ? (this.originalBasicValue || 0) * 12
        : this.originalBasicValue,
    });

    // Normalize and save for toggling
    this.originalBasicValue = data["basicCTC"] ?? null;
    if (data["hra"] != null) this.originalHraValue = data["hra"];

    // Update PAN/UAN in UI + persist
    this.payslipMeta.pan = data.pan ?? undefined;
    this.payslipMeta.uan = data.uan ?? undefined;

    this.taxpayerService.setPartial({
      payslipPreviewUrl: this.filePreviewUrl,
      pan: data.pan ?? undefined,
      uan: data.uan ?? undefined,
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

  resetPayslip(): void {
    if (this.filePreviewUrl) {
      URL.revokeObjectURL(this.filePreviewUrl);
      this.filePreviewUrl = null;
    }

    this.selectedFile = null;
    this.payslipMeta = {};
    this.originalBasicValue = null;
    this.originalHraValue = null;

    this.form.reset();
    this.createForm(); // reinitialize controls
    this.updateTotalCTC();

    this.taxpayerService.setPartial({
      payslipPreviewUrl: null,
      pan: undefined,
      uan: undefined,
    });
  }
}

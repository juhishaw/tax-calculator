import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TaxpayerDetailsService } from "src/app/core/taxpayer-details.service";
import { Router } from "@angular/router";
import { TaxPreviewService } from "src/app/core/tax-preview.service";
import { debounceTime } from "rxjs";
import { TaxUtilsService } from "src/app/utils/tax-utils.service";

@Component({
  selector: "app-house-property",
  templateUrl: "./house-property.component.html",
  styleUrls: ["./house-property.component.scss"],
})
export class HousePropertyComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private taxpayerService: TaxpayerDetailsService,
    private router: Router,
    private taxPreview: TaxPreviewService,
    public taxUtils: TaxUtilsService
  ) {}

  ngOnInit(): void {
    this.createForm();
    const saved = this.taxpayerService.getData();
    this.form.patchValue(saved);

    this.form.valueChanges
      .pipe(debounceTime(300))
      .subscribe((val) => this.taxPreview.updateFormPartials(val));
  }

  createForm(): void {
    this.form = this.fb.group({
      loanAmount: [null],
      interestRate: [null],
      startDate: [""],
      houseType: ["self"],

      //Spouse
      spouseSupport: [false],
      spouseIncome: [null],
      jointHomeLoanInterest: [null],
    });
  }

  calculateInterest(): number {
    const { loanAmount, interestRate, startDate } = this.form.value;

    if (!loanAmount || !interestRate || !startDate) {
      return 0;
    }

    const rate = interestRate / 100;
    const start = new Date(startDate);
    const months = Math.max(0, 12 - start.getMonth()); // Remaining months
    return +(loanAmount * rate * (months / 12)).toFixed(2);
  }

  next() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const interest = this.calculateInterest();
    this.taxpayerService.setPartial({ homeLoanInterest: interest });
    this.taxPreview.updateFormPartials(this.form.getRawValue());
    this.router.navigate(["/comparison"]);
  }

  back() {
    this.taxPreview.updateFormPartials(this.form.getRawValue());
    const interest = this.calculateInterest();
    this.taxpayerService.setPartial({ homeLoanInterest: interest });
    this.router.navigate(["/deductions"]);
  }

  get yourInterest(): number {
    const { loanAmount, interestRate, startDate, spouseSupport } =
      this.form.value;

    if (!spouseSupport && !loanAmount) return 0;
    if (!loanAmount || !interestRate || !startDate) return 0;

    const months = Math.max(0, 12 - new Date(startDate).getMonth());
    return +(loanAmount * (interestRate / 100) * (months / 12)).toFixed(2);
  }

  get spouseInterest(): number {
    return this.form.get("jointHomeLoanInterest")?.value || 0;
  }

  get totalClaimed(): number {
    return this.yourInterest + this.spouseInterest;
  }

  get combinedHomeLoanUtil(): number {
    return Math.min(100, (this.totalClaimed / 200000) * 100);
  }
}

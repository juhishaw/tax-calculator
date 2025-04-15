import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { debounceTime } from "rxjs";
import { TaxPreviewService } from "src/app/core/tax-preview.service";
import { TaxpayerDetailsService } from "src/app/core/taxpayer-details.service";
import { TaxUtilsService } from "src/app/utils/tax-utils.service";

@Component({
  selector: "app-deductions",
  templateUrl: "./deductions.component.html",
  styleUrls: ["./deductions.component.scss"],
})
export class DeductionsComponent implements OnInit {
  form!: FormGroup;
  totalDeduction = 0;
  used80C = 0;
  used80D = 0;
  usedNPS = 0;
  util80C = 0;
  util80D = 0;
  utilNPS = 0;
  max80D = 50000;
  hraClaimed = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private taxpayerService: TaxpayerDetailsService,
    private taxPreview: TaxPreviewService,
    public taxUtils: TaxUtilsService
  ) {}

  ngOnInit(): void {
    this.createForm();
    const saved = this.taxpayerService.getData();
    this.form.patchValue(saved);
    this.hraClaimed = saved?.hra || 0;

    this.form.valueChanges.subscribe(() => this.calculateTotals());
    this.form.valueChanges
      .pipe(debounceTime(300))
      .subscribe((val) => this.taxPreview.updateFormPartials(val));

    this.calculateTotals();
  }

  createForm(): void {
    this.form = this.fb.group({
      // Section 80C
      ppf: [null, [Validators.min(0)]],
      lic: [null, [Validators.min(0)]],
      pf: [null, [Validators.min(0)]],
      fd80C: [null, [Validators.min(0)]],
      sukanya: [null, [Validators.min(0)]],
      elss: [null, [Validators.min(0)]],
      nsc: [null, [Validators.min(0)]],
      ulip: [null, [Validators.min(0)]],
      tuitionFees: [null, [Validators.min(0)]],
      pension80C: [null, [Validators.min(0)]],
      fd5yr: [null, [Validators.min(0)]],
      housingPrincipal: [null, [Validators.min(0)]],
      pension80ccc: [null, [Validators.min(0)]],
  
      // Section 80D
      healthInsuranceSelf: [null, [Validators.min(0)]],
      healthInsuranceParents: [null, [Validators.min(0)]],
      parentsAbove60: [false],
  
      // 80CCD(1B)
      nps: [null, [Validators.min(0)]],
  
      // Other
      educationLoanInterest: [null, [Validators.min(0)]],
      donations80G: [null, [Validators.min(0)]],
      savingsInterest: [null, [Validators.min(0), Validators.max(10000)]],
      noHraRentPaid: [null, [Validators.min(0)]],
  
      // Merge Toggle: Either Self or Dependent
      disabilityClaimType: ['none'], // none | self | dependent
  
      // Self (80U)
      disabilityPercentage: [null],
      disabilitySeverity: ['normal'],
  
      // Dependent (80DD)
      dependentDisabilityPercentage: [null],
      dependentSeverity: ['normal'],
  
      // Additional
      section80ddb: [null, [Validators.min(0)]],
      section80eeb: [null, [Validators.min(0)]],
    });
  
    this.form.get('disabilityClaimType')?.valueChanges.subscribe((type) => {
      const selfCtrl = this.form.get('disabilityPercentage');
      const depCtrl = this.form.get('dependentDisabilityPercentage');
  
      if (type === 'self') {
        selfCtrl?.setValidators([Validators.required, Validators.min(40), Validators.max(100)]);
        depCtrl?.clearValidators();
      } else if (type === 'dependent') {
        depCtrl?.setValidators([Validators.required, Validators.min(40), Validators.max(100)]);
        selfCtrl?.clearValidators();
      } else {
        selfCtrl?.clearValidators();
        depCtrl?.clearValidators();
      }
  
      selfCtrl?.updateValueAndValidity();
      depCtrl?.updateValueAndValidity();
    });
  }
  
  calculateTotals(): void {
    const v = this.form.getRawValue();
  
    // 80C
    const cItems = [
      v.ppf,
      v.lic,
      v.pf,
      v.fd80C,
      v.elss,
      v.nsc,
      v.ulip,
      v.tuitionFees,
      v.pension80C,
      v.fd5yr,
      v.housingPrincipal,
      v.pension80ccc,
      v.sukanya,
    ];
    this.used80C = Math.min(150000, cItems.map(Number).reduce((a, b) => a + (b || 0), 0));
    this.util80C = Math.round((this.used80C / 150000) * 100);
  
    // 80D
    const parentLimit = v.parentsAbove60 ? 50000 : 25000;
    this.max80D = 25000 + parentLimit;
    this.used80D =
      Math.min(25000, v.healthInsuranceSelf || 0) +
      Math.min(parentLimit, v.healthInsuranceParents || 0);
    this.util80D = Math.round((this.used80D / this.max80D) * 100);
  
    // 80CCD(1B) – NPS
    this.usedNPS = Math.min(50000, v.nps || 0);
    this.utilNPS = Math.round((this.usedNPS / 50000) * 100);
  
    // EV Interest
    const evInterest = v.section80eeb || 0;
  
    // Section 80DD/80DDB
    const dependentDisability = v.section80dd || 0;
    const criticalIllness = v.section80ddb || 0;
  
    // Other deductions
    const miscDeductions = [
      v.educationLoanInterest,
      v.donations80G,
      v.savingsInterest,
      v.noHraRentPaid,
      evInterest,
      dependentDisability,
      criticalIllness
    ];
  
    this.totalDeduction = [
      this.used80C,
      this.used80D,
      this.usedNPS,
      ...miscDeductions
    ]
    .map(Number)
    .reduce((a, b) => a + (b || 0), 0);
  }
  

  next(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.taxPreview.updateFormPartials(this.form.getRawValue());
    this.taxpayerService.setPartial(this.form.value);
    this.router.navigate(["/house-property"]);
  }

  back(): void {
    this.taxPreview.updateFormPartials(this.form.getRawValue());
    this.taxpayerService.setPartial(this.form.value);
    this.router.navigate(["/salary-input"]);
  }
}

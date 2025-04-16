export interface TaxpayerDetails {
  // 💼 Income & Salary Details
  salary: number;
  basicPercentage: number;
  hra: number;
  hraIsMonthly?: any;
  basicIsMonthly?: any;
  rentPaid: number;
  isMetro: boolean;
  totalCTC: number;
  basicCTC: number;
  transportAllowance: number;
  useMonthly: boolean;
  monthlyGross: number;
  annualSalary: number;

  // 🍱 Reimbursements
  medicalAllowance: number;
  medicalClaimed: number;
  foodCard: number;

  // 📦 Section 80C
  ppf: number;
  lic: number;
  pf: number;
  fd80C: number;
  fd5yr: number;
  elss: number;
  nsc: number;
  ulip: number;
  sukanya: number;
  tuitionFees: number;
  housingPrincipal: number;
  pension80C: number;
  pension80ccc: number;

  // 🏥 Section 80D
  healthInsuranceSelf: number;
  healthInsuranceParents: number;
  parentsAbove60: boolean;

  // 🏦 NPS (80CCD 1B)
  nps: number;

  // 📚 Other VI-A
  educationLoanInterest: number;
  donations80G: number;
  savingsInterest: number;
  noHraRentPaid: number;

  // ♿ Disability
  disabilityClaimType: 'none' | 'self' | 'dependent';
  disabilityPercentage: number | null;
  disabilitySeverity: 'normal' | 'severe';
  dependentDisabilityPercentage: number | null;
  dependentSeverity: 'normal' | 'severe';

  // ⚕️ Advanced Medical
  section80ddb: number;
  section80eeb: number;

  // 🚘 EV
  electricVehicleInterest: number;

  // 🏠 House Property
  homeLoanInterest: number;
  houseType: 'self' | 'letout' | 'vacant';

  // 💑 Spouse
  spouseSupport: boolean;
  spouseIncome: number;
  jointHomeLoanInterest: number;

  uan?: any;
  pan?: any;
  payslipPreviewUrl?: string | null;
}

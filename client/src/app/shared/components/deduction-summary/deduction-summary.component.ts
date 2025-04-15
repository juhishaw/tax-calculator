import { Component, Input, OnInit } from '@angular/core';
import { TaxpayerDetails } from 'src/app/models/tax.model';
import { TaxService } from 'src/app/core/tax.service';

@Component({
  selector: 'app-deduction-summary',
  templateUrl: './deduction-summary.component.html',
  styleUrls: ['./deduction-summary.component.scss'],
})
export class DeductionSummaryComponent implements OnInit {
  @Input() data!: TaxpayerDetails;

  rows: {
    section: string;
    limit: number | string;
    used: number;
    remaining: number;
  }[] = [];

  constructor(private taxService: TaxService) {}

  ngOnInit(): void {
    const hraExemption = this.taxService.getHRAExemption(this.data);

    const section80CUsed = Math.min(
      150000,
      (this.data.ppf || 0) + (this.data.lic || 0) + (this.data.pf || 0),
    );
    const section80DUsed = Math.min(25000, this.data.healthInsuranceSelf || 0);
    const section80CCD1BUsed = Math.min(50000, this.data.nps || 0);
    const section24bUsed = Math.min(200000, this.data.homeLoanInterest || 0);

    this.rows = [
      {
        section: '80C',
        limit: 150000,
        used: section80CUsed,
        remaining: 150000 - section80CUsed,
      },
      {
        section: '80D',
        limit: 25000,
        used: section80DUsed,
        remaining: 25000 - section80DUsed,
      },
      {
        section: '80CCD(1B)',
        limit: 50000,
        used: section80CCD1BUsed,
        remaining: 50000 - section80CCD1BUsed,
      },
      {
        section: 'HRA Exemption',
        limit: 'As per calculation',
        used: Math.round(hraExemption),
        remaining: 0,
      },
      {
        section: '24(b) Home Loan Interest',
        limit: 200000,
        used: section24bUsed,
        remaining: 200000 - section24bUsed,
      },
    ];
  }
}

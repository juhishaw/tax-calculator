import { Component, OnInit } from '@angular/core';
import { TaxService } from 'src/app/core/tax.service';
import { TaxpayerDetailsService } from 'src/app/core/taxpayer-details.service';
import { TaxpayerDetails } from 'src/app/models/tax.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-comparison',
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.scss'],
})
export class ComparisonComponent implements OnInit {
  data!: TaxpayerDetails;
  oldTax = 0;
  newTax = 0;
  recommended: 'old' | 'new' = 'old';

  constructor(
    private taxService: TaxService,
    private taxpayerService: TaxpayerDetailsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.data = this.taxpayerService.getFinal();
    this.oldTax = Math.round(this.taxService.calculateOldRegimeTax(this.data));
    this.newTax = Math.round(this.taxService.calculateNewRegimeTax(this.data));
    this.recommended = this.oldTax < this.newTax ? 'old' : 'new';
  }

  next() {
    this.router.navigate(['/results-summary']);
  }

  back() {
    this.router.navigate(['/house-property']);
  }
}

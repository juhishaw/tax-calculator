import { Component, Input, OnInit } from '@angular/core';
import { TaxpayerDetails } from 'src/app/models/tax.model';

@Component({
  selector: 'app-suggestions-footer',
  templateUrl: './suggestions-footer.component.html',
  styleUrls: ['./suggestions-footer.component.scss'],
})
export class SuggestionsFooterComponent implements OnInit {
  @Input() data!: TaxpayerDetails;
  @Input() deductions!: {
    remaining80C: number;
    remaining80D: number;
  };
  @Input() taxableFoodCard = 0;
  @Input() oldTax = 0;
  @Input() newTax = 0;

  constructor() {}

  ngOnInit(): void {}
}

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TaxPreviewService } from 'src/app/core/tax-preview.service';
import { TaxService } from 'src/app/core/tax.service';
import { TaxpayerDetails } from 'src/app/models/tax.model';

@Component({
  selector: 'app-tax-preview-widget',
  templateUrl: './tax-preview-widget.component.html',
  styleUrls: ['./tax-preview-widget.component.scss'],
})
export class TaxPreviewWidgetComponent implements OnInit {
  @Input() data!: TaxpayerDetails;

  oldTax = 0;
  newTax = 0;
  better: 'old' | 'new' = 'old';

  constructor(
    private taxService: TaxService,
    private taxPreview: TaxPreviewService,
  ) {}

  ngOnInit(): void {
    this.taxPreview.preview$.subscribe((merged: any) => {
      this.data = merged;

      const hasRequiredFields =
        merged.salary && merged.basicPercentage !== undefined;

      if (!hasRequiredFields) {
        this.oldTax = this.newTax = 0;
        this.better = 'old';
        return;
      }

      try {
        this.oldTax = Math.round(this.taxService.calculateOldRegimeTax(merged));
        this.newTax = Math.round(this.taxService.calculateNewRegimeTax(merged));
        this.better = this.oldTax < this.newTax ? 'old' : 'new';
      } catch (err) {
        console.warn('Tax calculation failed', err);
        this.oldTax = this.newTax = 0;
        this.better = 'old';
      }
    });
  }
}

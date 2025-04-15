import { Component, OnInit } from '@angular/core';
import { TaxpayerDetailsService } from 'src/app/core/taxpayer-details.service';
import { exportTaxHelperSheet, TaxService } from 'src/app/core/tax.service';
import { TaxpayerDetails } from 'src/app/models/tax.model';
import { Router } from '@angular/router';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ChartData, ChartType } from 'chart.js';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-results-summary',
  templateUrl: './results-summary.component.html',
  styleUrls: ['./results-summary.component.scss'],
})
export class ResultsSummaryComponent implements OnInit {
  data!: TaxpayerDetails;
  oldTax = 0;
  newTax = 0;
  better: 'old' | 'new' = 'old';
  taxableFoodCard = 0;
  deductions!: {
    total80C: number;
    total80D: number;
    npsDeduction: number;
    homeLoanDeduction: number;
    housePropertySetoff: number;
    totalDeductions: number;
    remaining80C: number;
    remaining80D: number;
  };
  adviceList: string[] = [];
  max80D = 0;

  public pieChartType: ChartType = 'pie';

  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [
      '80C (PPF/LIC/PF)',
      '80D (Health)',
      'NPS (80CCD(1B))',
      'Home Loan (24b)',
    ],
    datasets: [
      {
        data: [], // initialized empty
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC'],
      },
    ],
  };

  constructor(
    private taxpayerService: TaxpayerDetailsService,
    private taxService: TaxService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.data = this.taxpayerService.getFinal();
    this.deductions = this.taxService.getDeductionBreakdown(this.data);

    if (!this.data || !this.data.salary) {
      // No data available (probably hard refresh)
      this.router.navigate(['/salary-input']);
      return;
    }

    this.oldTax = Math.round(this.taxService.calculateOldRegimeTax(this.data));
    this.newTax = Math.round(this.taxService.calculateNewRegimeTax(this.data));
    this.better = this.oldTax < this.newTax ? 'old' : 'new';
    this.taxableFoodCard = this.taxService.getTaxableFoodCard(
      this.data.foodCard || 0,
    );

    this.pieChartData.labels = [
      '80C (PPF/LIC/PF etc.)',
      '80D (Health)',
      'NPS (80CCD(1B))',
      'Home Loan (24b)',
      'Disability (80U/80DD)',
      'Medical (80DDB)',
      'EV Loan (80EEB)'
    ];
    
    this.pieChartData.datasets[0].data = [
      this.deductions.total80C,
      this.deductions.total80D,
      this.deductions.npsDeduction,
      this.deductions.housePropertySetoff,
      this.getDisabilityDeduction(),
      this.data.section80ddb || 0,
      this.data.section80eeb || 0
    ];

    const query = new URLSearchParams(window.location.search);
    const encoded = query.get('data');
    if (encoded) {
      try {
        const decoded = JSON.parse(atob(encoded));
        this.taxpayerService.setPartial(decoded);
        this.data = this.taxpayerService.getFinal();
        alert('✅ Summary restored from shared link!');
      } catch {
        alert('❌ Failed to parse shared data.');
      }
    }
  }

  getDisabilityDeduction(): number {
    if (this.data.disabilityClaimType === 'self') {
      return this.data.disabilitySeverity === 'severe' ? 125000 : 75000;
    } else if (this.data.disabilityClaimType === 'dependent') {
      return this.data.dependentSeverity === 'severe' ? 125000 : 75000;
    }
    return 0;
  }
  

  downloadPDF(): void {
    const element = document.querySelector('.no-form') as HTMLElement;

    html2canvas(element, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let position = 0;

      if (imgHeight <= pdfHeight) {
        // Single page
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      } else {
        // Multi-page handling
        let remainingHeight = imgHeight;
        while (remainingHeight > 0) {
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
          remainingHeight -= pdfHeight;
          position -= pdfHeight;

          if (remainingHeight > 0) pdf.addPage();
        }
      }

      pdf.save('Tax-Summary.pdf');
    });
  }

  copySummaryLink(): void {
    const base64 = btoa(JSON.stringify(this.data));
    const url = `${environment.baseUrl}/results-summary?data=${base64}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('🔗 Summary link copied to clipboard!');
    });
  }

  startOver() {
    this.taxpayerService.clear(); // optional if you want to wipe memory
    this.router.navigate(['/salary-input']);
  }

  exportAsXLSX(): void {
    exportTaxHelperSheet(this.data); // or shape your own object summary
  }
}

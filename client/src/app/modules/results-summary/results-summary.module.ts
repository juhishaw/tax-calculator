import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResultsSummaryRoutingModule } from './results-summary-routing.module';
import { ResultsSummaryComponent } from './results-summary.component';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ResultsSummaryComponent
  ],
  imports: [
    CommonModule,
    ResultsSummaryRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    NgChartsModule,
    SharedModule
  ]
})
export class ResultsSummaryModule { }

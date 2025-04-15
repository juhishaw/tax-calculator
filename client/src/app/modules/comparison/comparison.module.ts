import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComparisonRoutingModule } from './comparison-routing.module';
import { ComparisonComponent } from './comparison.component';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    ComparisonComponent
  ],
  imports: [
    CommonModule,
    ComparisonRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class ComparisonModule { }

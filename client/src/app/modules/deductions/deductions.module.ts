import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DeductionsRoutingModule } from './deductions-routing.module';
import { DeductionsComponent } from './deductions.component';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    DeductionsComponent
  ],
  imports: [
    CommonModule,
    DeductionsRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class DeductionsModule { }

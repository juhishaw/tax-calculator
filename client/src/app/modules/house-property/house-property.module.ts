import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HousePropertyRoutingModule } from './house-property-routing.module';
import { HousePropertyComponent } from './house-property.component';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    HousePropertyComponent
  ],
  imports: [
    CommonModule,
    HousePropertyRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class HousePropertyModule { }

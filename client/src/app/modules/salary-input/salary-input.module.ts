import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SalaryInputRoutingModule } from "./salary-input-routing.module";
import { SalaryInputComponent } from "./salary-input.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "src/app/shared/material/material.module";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  declarations: [SalaryInputComponent],
  imports: [
    CommonModule,
    SalaryInputRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule
  ],
})
export class SalaryInputModule {}

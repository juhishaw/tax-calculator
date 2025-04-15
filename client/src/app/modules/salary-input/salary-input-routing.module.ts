import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalaryInputComponent } from './salary-input.component';

const routes: Routes = [{ path: '', component: SalaryInputComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalaryInputRoutingModule { }

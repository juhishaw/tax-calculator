import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeductionsComponent } from './deductions.component';

const routes: Routes = [{ path: '', component: DeductionsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeductionsRoutingModule { }

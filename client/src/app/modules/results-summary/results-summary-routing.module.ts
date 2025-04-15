import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResultsSummaryComponent } from './results-summary.component';

const routes: Routes = [{ path: '', component: ResultsSummaryComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResultsSummaryRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HousePropertyComponent } from './house-property.component';

const routes: Routes = [{ path: '', component: HousePropertyComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HousePropertyRoutingModule { }

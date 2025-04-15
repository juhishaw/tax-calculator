import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    redirectTo: "salary-input",
    pathMatch: "full",
  },
  {
    path: "salary-input",
    loadChildren: () =>
      import("./modules/salary-input/salary-input.module").then(
        (m) => m.SalaryInputModule
      ),
  },
  // {
  //   path: "income-input",
  //   loadChildren: () =>
  //     import("./modules/income-input/income-input.module").then(
  //       (m) => m.IncomeInputModule
  //     ),
  // },
  {
    path: "deductions",
    loadChildren: () =>
      import("./modules/deductions/deductions.module").then(
        (m) => m.DeductionsModule
      ),
  },
  {
    path: "house-property",
    loadChildren: () =>
      import("./modules/house-property/house-property.module").then(
        (m) => m.HousePropertyModule
      ),
  },
  {
    path: "comparison",
    loadChildren: () =>
      import("./modules/comparison/comparison.module").then(
        (m) => m.ComparisonModule
      ),
  },
  {
    path: "results-summary",
    loadChildren: () =>
      import("./modules/results-summary/results-summary.module").then(
        (m) => m.ResultsSummaryModule
      ),
  },
  {
    path: "salary-input",
    loadChildren: () =>
      import("./modules/salary-input/salary-input.module").then(
        (m) => m.SalaryInputModule
      ),
  },
  {
    path: "**",
    redirectTo: "salary-input", // fallback for unknown routes
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

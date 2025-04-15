import { Injectable } from "@angular/core";
import { BehaviorSubject, debounceTime, combineLatest, map } from "rxjs";
import { TaxpayerDetails } from "../models/tax.model";
import { TaxpayerDetailsService } from "./taxpayer-details.service";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class TaxPreviewService {
  private localForm$ = new BehaviorSubject<Partial<TaxpayerDetails>>({});
  public preview$ = combineLatest([
    this.taxpayerDetailsService.data$,
    this.localForm$,
  ]).pipe(
    debounceTime(300),
    // Combine stored + form data
    map(([stored, form]) => ({ ...stored, ...form }))
  );

  constructor(
    private taxpayerDetailsService: TaxpayerDetailsService,
    private http: HttpClient
  ) {}

  updateFormPartials(partial: Partial<TaxpayerDetails>) {
    this.localForm$.next(partial);
  }

  clearFormBuffer() {
    this.localForm$.next({});
  }

  uploadPayslip(formData: FormData) {
    return this.http.post('https://tax-optimizer.onrender.com/api/payslip-upload', formData);
  }
}

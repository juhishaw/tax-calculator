import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TaxUtilsService {

  constructor() { }

  blockInvalid(event: KeyboardEvent) {
    const invalidChars = ['-', '+', 'e', 'E'];
    if (invalidChars.includes(event.key)) {
      event.preventDefault();
    }
  }
}


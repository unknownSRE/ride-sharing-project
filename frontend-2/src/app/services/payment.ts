
// src/app/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// If you have environment.ts, you can replace these with environment.soapUrl / environment.soapNs
const SOAP_URL = 'http://localhost:3000/soap/payment';
const SOAP_NS  = 'http://localhost:3000/soap/payment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private http: HttpClient) {}

  private buildEnvelope(ride_id: number, amount: number, method: string) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="${SOAP_NS}">
  <soap:Body>
    <tns:createPaymentRequest>
      <tns:ride_id>${ride_id}</tns:ride_id>
      <tns:amount>${amount}</tns:amount>
      <tns:method>${method}</tns:method>
    </tns:createPaymentRequest>
  </soap:Body>
</soap:Envelope>`;
  }

  /**
   * Calls SOAP createPayment and returns the raw XML text.
   * method must be one of: cash | credit_card | wallet | upi
   */
  createPayment(ride_id: number, amount: number, method: 'cash'|'credit_card'|'wallet'|'upi') {
    const headers = new HttpHeaders({
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'createPaymentRequest'
    });
    const body = this.buildEnvelope(ride_id, amount, method);
    return this.http.post(SOAP_URL, body, { headers, responseType: 'text' });
  }
}

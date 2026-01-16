
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { PaymentService } from '../../services/payment';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<div class="container">
  <section class="service-card">
    <div class="card-header">
      <i class="fas fa-credit-card"></i><h3>Make Payment (SOAP)</h3>
    </div>

    <form [formGroup]="form" (ngSubmit)="submit()">
      <div class="card-body">
        <input type="number" placeholder="Ride ID" formControlName="rideId" />
        <!-- Ride ID -->
        <div
          *ngIf="form.get('rideId')?.invalid && form.get('rideId')?.touched"
          class="text-muted">
          Ride ID is required (positive integer).
        </div>


        <input type="number" placeholder="Amount (₹)" step="0.01" formControlName="amount" />        
        <!-- Amount -->
        <div
          *ngIf="form.get('amount')?.invalid && form.get('amount')?.touched"
          class="text-muted">
          Enter a valid amount &gt; 0
        </div>


        <select formControlName="method">
          <option value="">Select Payment Method</option>
          <option value="cash">Cash</option>
          <option value="credit_card">Credit Card</option>
          <option value="wallet">Wallet</option>
          <option value="upi">UPI</option>
        </select>        
        <!-- Method -->
        <div
          *ngIf="form.get('method')?.invalid && form.get('method')?.touched"
          class="text-muted">
          Select a payment method.
        </div>


        <button type="submit" class="btn-primary btn-block" [disabled]="form.invalid">
          Process Payment
        </button>
      </div>
    </form>

    <div class="card-body" *ngIf="lastResponse">
      <h4>Response</h4>
      <pre style="white-space:pre-wrap">{{ lastResponse }}</pre>
      <div *ngIf="status">
        <p><strong>Status:</strong> {{ status }}</p>
        <p *ngIf="message"><strong>Message:</strong> {{ message }}</p>
        <p *ngIf="paymentId"><strong>Payment ID:</strong> {{ paymentId }}</p>
      </div>
    </div>
  </section>
</div>
  `
})
export class PaymentComponent {
  form!: FormGroup; // declare first (non-null assertion)

  lastResponse = '';
  status = '';
  message = '';
  paymentId: number | null = null;

  constructor(private fb: FormBuilder, private payment: PaymentService) {
    // Initialize AFTER fb is injected
    this.form = this.fb.group({
      rideId: [null, [Validators.required, Validators.min(1)]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      method: ['', Validators.required],
    });
  }

  private extract(tag: string, xml: string): string | null {
    const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const m = xml.match(re);
    return m ? m[1] : null;
  }

  private hasFault(xml: string) {
    return /<soap:Fault/i.test(xml) || /<Fault>/i.test(xml);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { rideId, amount, method } = this.form.value;
    this.status = ''; this.message = ''; this.paymentId = null; this.lastResponse = '';

    this.payment.createPayment(Number(rideId), Number(amount), method as any)
      .subscribe({
        next: (xml) => {
          this.lastResponse = xml;

          if (this.hasFault(xml)) {
            this.status = 'FAILED';
            this.message = this.extract('faultstring', xml) || 'SOAP Fault';
            return;
          }

          this.status = (this.extract('status', xml) || '').toUpperCase();
          this.message = this.extract('message', xml) || '';
          const pid = this.extract('paymentId', xml);
          this.paymentId = pid ? Number(pid) : null;

          if (!this.status) this.status = /SUCCESS/i.test(xml) ? 'SUCCESS' : 'UNKNOWN';
        },
        error: (err) => {
          this.lastResponse = String(err?.message || err);
          this.status = 'ERROR';
          this.message = 'Network or server error. Check backend.';
        }
      });
  }
}

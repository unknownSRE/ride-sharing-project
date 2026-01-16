// frontend-2/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { UserAuthComponent } from './components/users/users';
import { RatingComponent } from './components/rating/rating';
import { PaymentComponent } from './components/payment/payment';

export const routes: Routes = [
  { path: 'auth', component: UserAuthComponent },
  { path: 'rate', component: RatingComponent },
  { path: 'payment', component: PaymentComponent },

  // Set default redirect (choose which one should be the landing page)
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth' },
];

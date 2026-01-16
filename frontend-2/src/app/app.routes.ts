// src/app/app.routes.ts
import { Routes } from '@angular/router';
<<<<<<< HEAD
import { UserAuthComponent } from './components/users/users';

export const routes: Routes = [
  { path: 'auth', component: UserAuthComponent },
  { path: '', redirectTo: 'auth', pathMatch: 'full' }, // Redirect default path to login
  { path: '**', redirectTo: 'auth' } // Wildcard route for 404s
];
=======
import { RatingComponent } from './components/rating/rating';
import { PaymentComponent } from './components/payment/payment';

export const routes: Routes = [
  { path: 'rate', component: RatingComponent },
  { path: 'payment', component: PaymentComponent },

  // optional: make / land on /payment for now:
  { path: '', redirectTo: 'payment', pathMatch: 'full' },
  { path: '**', redirectTo: 'payment' }
];
>>>>>>> e36b206854647ef99048640b37e42184ee96a223

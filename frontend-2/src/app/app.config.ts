<<<<<<< HEAD
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
=======
// src/app/app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http'; // <-- add

>>>>>>> e36b206854647ef99048640b37e42184ee96a223
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
<<<<<<< HEAD
    provideRouter(routes),     // Links your paths to the app
    provideHttpClient()        // Allows your UserService to call the backend
=======
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(), // <-- add
>>>>>>> e36b206854647ef99048640b37e42184ee96a223
  ]
};
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { connectAuthEmulator, provideAuth, getAuth } from '@angular/fire/auth';
import { AuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import {
  connectFirestoreEmulator,
  provideFirestore,
  getFirestore
} from '@angular/fire/firestore';
import {
  connectStorageEmulator,
  provideStorage,
  getStorage
} from '@angular/fire/storage';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSidenavModule } from '@angular/material/sidenav';
import {
  MatSnackBarModule,
  MAT_SNACK_BAR_DEFAULT_OPTIONS
} from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Route, RouterModule } from '@angular/router';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NgxUiLoaderModule, NgxUiLoaderRouterModule } from 'ngx-ui-loader';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RegisterComponent } from './register.component';
import { SchedulerComponent } from './scheduler/scheduler.component';
import { SignInComponent } from './sign-in.component';
import { StudentComponent } from './student/student.component';
import { TutorComponent } from './tutor/tutor.component';

const routes: Route[] = [
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: () => redirectLoggedInTo('/') }
  },
  {
    path: 'sign-in',
    component: SignInComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: () => redirectLoggedInTo('/') }
  },
  {
    path: 'student',
    component: StudentComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo('/sign-in') }
  },
  {
    path: 'tutor',
    component: TutorComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo('/sign-in') }
  },
  { path: '', redirectTo: '/tutor', pathMatch: 'full' },
  { path: '**', component: SignInComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    RegisterComponent,
    SchedulerComponent,
    SignInComponent,
    StudentComponent,
    TutorComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatListModule,
    MatNativeDateModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatToolbarModule,
    NgxUiLoaderModule,
    NgxUiLoaderRouterModule,
    NgxAuthFirebaseUIModule.forRoot(environment.firebase, () => undefined, {
      enableFirestoreSync: false,
      enableEmailVerification: false,
      toastMessageOnAuthError: false,
      toastMessageOnAuthSuccess: false
    }),
    NgxMaterialTimepickerModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => {
      const auth = getAuth();
      if (!environment.production) {
        connectAuthEmulator(auth, 'http://localhost:9099');
      }
      return auth;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (!environment.production) {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
      }
      return firestore;
    }),
    provideStorage(() => {
      const storage = getStorage();
      if (!environment.production) {
        connectStorageEmulator(storage, 'localhost', 9199);
      }
      return storage;
    }),
    ReactiveFormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 5000,
        verticalPosition: 'top'
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

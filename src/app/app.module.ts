import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { connectAuthEmulator, provideAuth, getAuth } from '@angular/fire/auth';
import {
  AuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo
} from '@angular/fire/auth-guard';
import {
  connectFirestoreEmulator,
  provideFirestore,
  getFirestore
} from '@angular/fire/firestore';
import {
  connectFunctionsEmulator,
  provideFunctions,
  getFunctions
} from '@angular/fire/functions';
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
import { MatDialogModule } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import {
  MatSnackBarModule,
  MAT_SNACK_BAR_DEFAULT_OPTIONS
} from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Route, RouterModule } from '@angular/router';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NgxUiLoaderModule, NgxUiLoaderRouterModule } from 'ngx-ui-loader';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { CloseSchedulerDialog } from './components/close-scheduler-dialog';
import { ConfirmManageSessionDialog } from './components/confirm-manage-session-dialog';
import { RegisterComponent } from './components/register.component';
import { SchedulerComponent } from './components/scheduler/scheduler.component';
import { SignInComponent } from './components/sign-in.component';
import { StudentComponent } from './components/student/student.component';
import { TutorComponent } from './components/tutor/tutor.component';
import { OrdinalDatePipe } from './ordinal-date.pipe';
import { SessionsTableComponent } from './components/sessions-table/sessions-table.component';
import { SessionsListComponent } from './components/sessions-list/sessions-list.component';
import { SettingsComponent } from './components/settings/settings.component';

const routes: Route[] = [
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: () => redirectLoggedInTo('/') }
  },
  {
    path: 'sessions',
    canActivate: [AuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo('/sign-in') },
    children: [
      { path: 'student', component: SessionsListComponent },
      { path: 'tutor', component: SessionsListComponent },
      { path: '**', redirectTo: 'student', pathMatch: 'full' }
    ]
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo('/sign-in') }
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
  { path: '', redirectTo: '/student', pathMatch: 'full' },
  { path: '**', component: SignInComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    CloseSchedulerDialog,
    ConfirmManageSessionDialog,
    RegisterComponent,
    SchedulerComponent,
    SignInComponent,
    StudentComponent,
    TutorComponent,
    OrdinalDatePipe,
    SessionsTableComponent,
    SessionsListComponent,
    SettingsComponent
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
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
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
    provideFunctions(() => {
      const functions = getFunctions();
      if (!environment.production) {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      return functions;
    }),
    provideStorage(() => {
      const storage = getStorage();
      if (!environment.production) {
        connectStorageEmulator(storage, 'localhost', 9199);
      }
      return storage;
    }),
    ReactiveFormsModule,
    RouterModule.forRoot(routes, { anchorScrolling: 'enabled' })
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

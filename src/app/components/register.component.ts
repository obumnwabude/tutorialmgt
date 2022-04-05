import { Component } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { User } from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { SnackbarHorizPosService } from '../services/snackbar-horiz-pos.service';

@Component({
  template: `<ngx-auth-firebaseui-register
    (onCreateAccountButtonClicked)="ngxLoader.start()"
    (onError)="showError($event)"
    (onLoginRequested)="router.navigateByUrl('/sign-in')"
    (onSuccess)="welcome($event)"
  ></ngx-auth-firebaseui-register>`
})
export class RegisterComponent {
  constructor(
    private firestore: Firestore,
    private shp: SnackbarHorizPosService,
    public ngxLoader: NgxUiLoaderService,
    public router: Router,
    private snackBar: MatSnackBar
  ) {}

  showError(error: FirebaseError) {
    this.ngxLoader.stop();
    let message;
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'Email already in use.';
        break;
      case 'auth/network-request-failed':
        message = 'Bad Network. Could not create account.';
        break;
      default:
        message = error.message;
    }
    this.snackBar.open(message, '', {
      panelClass: ['snackbar-error'],
      horizontalPosition: this.shp.value
    });
  }

  async welcome(user: User) {
    try {
      await setDoc(
        doc(this.firestore, `/users/${user.uid}`),
        {
          authInfo: { displayName: user?.displayName }
        },
        { merge: true }
      );
    } catch (error) {
      console.error(error);
    }
    this.ngxLoader.stop();
    this.snackBar.open(`Welcome ${user.displayName?.split(' ')[0]}!`, '', {
      panelClass: ['snackbar-success'],
      horizontalPosition: this.shp.value
    });
    this.router.navigateByUrl('/');
  }
}

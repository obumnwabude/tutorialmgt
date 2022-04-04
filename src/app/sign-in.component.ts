import { Component } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { User } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  template: `<ngx-auth-firebaseui-login
    [providers]="[]"
    [resetPasswordEnabled]="false"
    (onCreateAccountRequested)="router.navigateByUrl('/register')"
    (onError)="showError($event)"
    (onLoginButtonClicked)="ngxLoader.start()"
    (onSuccess)="welcome($event)"
  ></ngx-auth-firebaseui-login>`
})
export class SignInComponent {
  constructor(
    public ngxLoader: NgxUiLoaderService,
    public router: Router,
    private snackBar: MatSnackBar
  ) {}

  showError(error: FirebaseError) {
    this.ngxLoader.stop();
    let message;
    switch (error.code) {
      case 'auth/network-request-failed':
        message = 'Bad Network. Could not sign in.';
        break;
      case 'auth/user-not-found':
        message = 'User not found. Please create account.';
        break;
      case 'auth/wrong-password':
        message = 'Wrong password';
        break;
      default:
        message = error.message;
    }
    this.snackBar.open(message, '', { panelClass: ['snackbar-error'] });
  }

  welcome(user: User) {
    this.ngxLoader.stop();
    this.snackBar.open(`Welcome back ${user.displayName?.split(' ')[0]}!`, '', {
      panelClass: ['snackbar-success']
    });
    this.router.navigateByUrl('/');
  }
}

import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  Auth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile
} from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  isEditingName = false;
  isEditingPassword = false;
  name = new FormControl(
    {
      value: this.auth.currentUser?.displayName,
      disabled: !this.isEditingName
    },
    Validators.required
  );
  oldPassword = new FormControl('', [
    Validators.required,
    Validators.minLength(8)
  ]);
  newPassword = new FormControl('', [
    Validators.required,
    Validators.minLength(8)
  ]);
  confirmPassword = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    this._validateSamePasswords.bind(this)
  ]);
  password = new FormGroup({
    old: this.oldPassword,
    new: this.newPassword,
    confirm: this.confirmPassword
  });
  @ViewChild('passwordForm') passwordFormRef!: ElementRef<HTMLFormElement>;

  constructor(
    public auth: Auth,
    private firestore: Firestore,
    private ngxLoader: NgxUiLoaderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  resetEditingPassword() {
    this.password.reset();
    this.passwordFormRef.nativeElement.reset();
    this.isEditingPassword = false;
  }

  editingPassword() {
    if (
      [this.oldPassword, this.newPassword, this.confirmPassword].every(
        (c) => !c.value
      )
    ) {
      this.resetEditingPassword();
    } else {
      this.isEditingPassword = true;
    }
  }

  private _validateSamePasswords(confirm: AbstractControl) {
    if (
      this.newPassword.value &&
      confirm.value &&
      this.newPassword.value !== confirm.value
    ) {
      return { confirm: false };
    }
    return null;
  }

  confirmPasswordError(): string {
    if (this.confirmPassword.hasError('required')) {
      return 'Required';
    } else if (this.confirmPassword.hasError('minLength')) {
      return 'At least 8 characters';
    } else {
      return 'Passwords do not match';
    }
  }

  async updateName() {
    if (this.name.invalid) {
      this.snackBar.open('First fill out your name or cancel.', '', {
        panelClass: ['snackbar-error'],
        horizontalPosition: 'center'
      });
    } else if (this.auth.currentUser != null) {
      try {
        this.ngxLoader.start();
        await updateProfile(this.auth.currentUser, {
          displayName: this.name.value
        });
        await setDoc(
          doc(this.firestore, `/users/${this.auth.currentUser.uid}`),
          { authInfo: { displayName: this.name.value } },
          { merge: true }
        );
        this.snackBar.open('Name successfully updated', '', {
          panelClass: ['snackbar-success'],
          horizontalPosition: 'center'
        });
        this.isEditingName = false;
        this.name.disable();
      } catch (error: any) {
        this.snackBar.open(error.message, '', {
          panelClass: ['snackbar-error'],
          horizontalPosition: 'center'
        });
      } finally {
        this.ngxLoader.stop();
      }
    } else {
      this.router.navigateByUrl('/sign-in');
    }
  }

  async updatePassword() {
    if (this.password.invalid) {
      this.snackBar.open('Please resolve all errors or cancel.', '', {
        panelClass: ['snackbar-error'],
        horizontalPosition: 'center'
      });
    } else if (this.auth.currentUser != null) {
      try {
        this.ngxLoader.start();
        await reauthenticateWithCredential(
          this.auth.currentUser,
          EmailAuthProvider.credential(
            this.auth.currentUser.email!,
            this.oldPassword.value
          )
        );
        await updatePassword(this.auth.currentUser, this.newPassword.value);
        this.snackBar.open('Password successfully updated', '', {
          panelClass: ['snackbar-success'],
          horizontalPosition: 'center'
        });
        this.resetEditingPassword();
      } catch (error: any) {
        if (error.code === 'auth/wrong-password') {
          this.snackBar.open('Wrong old password', '', {
            panelClass: ['snackbar-error'],
            horizontalPosition: 'center'
          });
        } else {
          this.snackBar.open(error.message, '', {
            panelClass: ['snackbar-error'],
            horizontalPosition: 'center'
          });
        }
      } finally {
        this.ngxLoader.stop();
      }
    } else {
      this.router.navigateByUrl('/sign-in');
    }
  }
}

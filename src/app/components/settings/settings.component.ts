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
  Storage,
  ref,
  uploadBytes,
  getDownloadURL
} from '@angular/fire/storage';
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
  isUploadingPhoto = false;
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
    private snackBar: MatSnackBar,
    private storage: Storage
  ) {}

  errorFeedback(message: string) {
    this.snackBar.open(message, '', {
      panelClass: ['snackbar-error'],
      horizontalPosition: 'center'
    });
  }

  successFeedback(message: string) {
    this.snackBar.open(message, '', {
      panelClass: ['snackbar-success'],
      horizontalPosition: 'center'
    });
  }

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
      this.errorFeedback('First fill out your name or cancel.');
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
        this.successFeedback('Name successfully updated');
        this.isEditingName = false;
        this.name.disable();
      } catch (error: any) {
        this.errorFeedback(error.message);
      } finally {
        this.ngxLoader.stop();
      }
    } else {
      this.router.navigateByUrl('/sign-in');
    }
  }

  async updatePassword() {
    if (this.password.invalid) {
      this.errorFeedback('Please resolve all errors or cancel.');
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
        this.successFeedback('Password successfully updated');
        this.resetEditingPassword();
      } catch (error: any) {
        const message =
          error.code === 'auth/wrong-password'
            ? 'Wrong old password'
            : error.message;
        this.errorFeedback(message);
      } finally {
        this.ngxLoader.stop();
      }
    } else {
      this.router.navigateByUrl('/sign-in');
    }
  }

  tappedPicker(): boolean {
    if (this.isUploadingPhoto) {
      this.errorFeedback('Photo is uploading, please wait...');
      return false;
    } else return true;
  }

  async pickedImage(event: any) {
    event.preventDefault();
    if (event.target.files.length === 0) return;
    const file = event.target.files[0];
    if (!file.type.match('image.*')) {
      this.errorFeedback('Please select only images');
    } else if (file.size > 500000) {
      this.errorFeedback('Maximum of 500kb please');
    } else if (this.auth.currentUser) {
      this.isUploadingPhoto = true;
      const fileNameParts = file.name.split('.');
      const ext = fileNameParts[fileNameParts.length - 1];
      const photoPath = `/profilePhotos/${this.auth.currentUser.uid}/photo.${ext}`;
      const photoRef = ref(this.storage, photoPath);
      try {
        await uploadBytes(photoRef, file);
        await updateProfile(this.auth.currentUser, {
          photoURL: await getDownloadURL(photoRef)
        });
        await this.auth.currentUser.reload();
      } catch (error: any) {
        this.errorFeedback(error.message);
      } finally {
        this.isUploadingPhoto = false;
      }
    } else {
      this.router.navigateByUrl('/sign-in');
    }
  }
}

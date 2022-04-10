import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SessionStatus } from '../models/session.model';

@Component({
  template: `<div>
    <h3 style="margin-bottom: 16px;">
      {{ status === 'accepted' ? 'Accept' : 'Reject' }}?
    </h3>
    <p style="margin-bottom: 24px;">
      Are you sure you want to
      {{ status === 'accepted' ? 'accept' : 'reject' }} this session?
    </p>
    <p text-right>
      <button
        mat-raised-button
        color="primary"
        (click)="dialogRef.close(true)"
        style="margin-right: 16px;"
      >
        Yes, {{ status === 'accepted' ? 'Accept' : 'Reject' }}.
      </button>
      <button
        mat-stroked-button
        color="primary"
        (click)="dialogRef.close(false)"
        style="margin-right: 16px;"
      >
        No, for now.
      </button>
    </p>
  </div>`
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class ConfirmManageSessionDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmManageSessionDialog>,
    @Inject(MAT_DIALOG_DATA) public status: SessionStatus
  ) {}
}

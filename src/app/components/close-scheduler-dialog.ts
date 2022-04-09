import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  template: `<div>
    <h3 style="margin-bottom: 16px;">Close?</h3>
    <p style="margin-bottom: 24px;">
      Are you sure you want to stop editing this session? All progress will be
      lost!
    </p>
    <p text-right>
      <button
        mat-raised-button
        color="primary"
        (click)="dialogRef.close(true)"
        style="margin-right: 16px;"
      >
        Yes, Close.
      </button>
      <button
        mat-stroked-button
        color="primary"
        (click)="dialogRef.close(false)"
        style="margin-right: 16px;"
      >
        No, keep editing.
      </button>
    </p>
  </div>`
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class CloseSchedulerDialog {
  constructor(public dialogRef: MatDialogRef<CloseSchedulerDialog>) {}
}

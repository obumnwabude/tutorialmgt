import { Injectable } from '@angular/core';
import { MatSnackBarHorizontalPosition } from '@angular/material/snack-bar';
import { IsLargeScreenService } from './is-large-screen.service';

@Injectable({
  providedIn: 'root'
})
export class SnackbarHorizPosService {
  value!: MatSnackBarHorizontalPosition;
  constructor(_ils: IsLargeScreenService) {
    _ils.value.subscribe((v) => this.value = v ? 'right' : 'center');
  }
}

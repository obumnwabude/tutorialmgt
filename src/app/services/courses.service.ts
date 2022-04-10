import { Injectable } from '@angular/core';
import { doc, Firestore, getDoc, onSnapshot } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  all = of([]);
  constructor(private firestore: Firestore, private snackBar: MatSnackBar) {
    onSnapshot(doc(this.firestore, '/resources/courses'), {
      next: (snap) =>
        (this.all = snap.exists() ? of(snap.data()['all'] ?? []) : of([])),
      error: (error) =>
        this.snackBar
          .open(error.message, 'REFRESH PAGE', {
            panelClass: ['snackbar-error'],
            horizontalPosition: 'center'
          })
          .onAction()
          .subscribe(() => window.location.reload())
    });
  }
}

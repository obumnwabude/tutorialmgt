import { ApplicationRef, Injectable } from '@angular/core';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  all = of([]);
  constructor(
    private firestore: Firestore,
    private appRef: ApplicationRef,
    private snackBar: MatSnackBar
  ) {
    getDoc(doc(this.firestore, '/resources/courses'))
      .then((snap) => {
        this.all = snap.exists() ? of(snap.data()['all'] ?? []) : of([]);
        this.appRef.tick();
      })
      .catch((error) => {
        firstValueFrom(
          this.snackBar
            .open(error.message, 'REFRESH PAGE', {
              panelClass: ['snackbar-error'],
              horizontalPosition: 'center'
            })
            .onAction()
        ).then(() => window.location.reload());
      });
  }
}

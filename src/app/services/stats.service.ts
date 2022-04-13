import { ApplicationRef, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  collection,
  doc,
  Firestore,
  onSnapshot,
  query,
  Timestamp,
  where
} from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  allSessions = of(0);
  scheduled = of(0);
  accepted = of(0);
  requested = of(0);
  studentPending = of(0);
  studentUpcoming = of(0);
  tutorUpcoming = of(0);

  constructor(
    private appRef: ApplicationRef,
    private auth: Auth,
    private firestore: Firestore,
    private snackBar: MatSnackBar
  ) {
    onSnapshot(doc(this.firestore, '/sessions/counter'), {
      next: (snap) =>
        (this.allSessions = snap.exists()
          ? of(snap.data()['count'] ?? 0)
          : of(0)),
      error: (error) =>
        this.snackBar
          .open(error.message, 'REFRESH PAGE', {
            panelClass: ['snackbar-error'],
            horizontalPosition: 'center'
          })
          .onAction()
          .subscribe(() => window.location.reload())
    });
    onSnapshot(
      doc(this.firestore, `/users/${this.auth.currentUser?.uid ?? ''}`),
      {
        next: (snap) => {
          if (snap.exists()) {
            this.accepted = of(snap.data()['stats']?.['accepted'] ?? 0);
            this.requested = of(snap.data()['stats']?.['requested'] ?? 0);
            this.scheduled = of(snap.data()['stats']?.['scheduled'] ?? 0);
            this.appRef.tick();
          }
        },
        error: (error) =>
          this.snackBar
            .open(error.message, 'REFRESH PAGE', {
              panelClass: ['snackbar-error'],
              horizontalPosition: 'center'
            })
            .onAction()
            .subscribe(() => window.location.reload())
      }
    );
    onSnapshot(
      query(
        collection(this.firestore, 'sessions'),
        where('student.id', '==', this.auth.currentUser?.uid ?? ''),
        where('status', '==', 'pending'),
        where('start', '>=', Timestamp.fromDate(new Date()))
      ),
      {
        next: (snap) => {
          if (snap.docs.length > 0) {
            this.studentPending = of(snap.docs.length);
            this.appRef.tick();
          }
        },
        error: (error) =>
          this.snackBar
            .open(error.message, 'REFRESH PAGE', {
              panelClass: ['snackbar-error'],
              horizontalPosition: 'center'
            })
            .onAction()
            .subscribe(() => window.location.reload())
      }
    );
    onSnapshot(
      query(
        collection(this.firestore, 'sessions'),
        where('student.id', '==', this.auth.currentUser?.uid ?? ''),
        where('status', '==', 'accepted'),
        where('start', '>=', Timestamp.fromDate(new Date()))
      ),
      {
        next: (snap) => {
          if (snap.docs.length > 0) {
            this.studentUpcoming = of(snap.docs.length);
            this.appRef.tick();
          }
        },
        error: (error) =>
          this.snackBar
            .open(error.message, 'REFRESH PAGE', {
              panelClass: ['snackbar-error'],
              horizontalPosition: 'center'
            })
            .onAction()
            .subscribe(() => window.location.reload())
      }
    );
    onSnapshot(
      query(
        collection(this.firestore, 'sessions'),
        where('tutor.id', '==', this.auth.currentUser?.uid ?? ''),
        where('status', '==', 'accepted'),
        where('start', '>=', Timestamp.fromDate(new Date()))
      ),
      {
        next: (snap) => {
          if (snap.docs.length > 0) {
            this.tutorUpcoming = of(snap.docs.length);
            this.appRef.tick();
          }
        },
        error: (error) =>
          this.snackBar
            .open(error.message, 'REFRESH PAGE', {
              panelClass: ['snackbar-error'],
              horizontalPosition: 'center'
            })
            .onAction()
            .subscribe(() => window.location.reload())
      }
    );
  }
}

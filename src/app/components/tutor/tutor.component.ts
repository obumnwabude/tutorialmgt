import { Component, OnDestroy, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  arrayUnion,
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { firstValueFrom, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { Session, SessionStatus } from '../../models/session.model';
import { CoursesService } from '../../services/courses.service';
import { SnackbarHorizPosService } from '../../services/snackbar-horiz-pos.service';
import { ConfirmManageSessionDialog } from '../confirm-manage-session-dialog';

@Component({
  templateUrl: './tutor.component.html',
  styleUrls: ['./tutor.component.scss']
})
export class TutorComponent implements OnInit {
  courseCtrl = new FormControl();
  filteredCourses: Observable<string[]>;
  selectedCourses: string[] = [];
  sessions: Session[] = [];

  constructor(
    private auth: Auth,
    private courses: CoursesService,
    public dialog: MatDialog,
    private firestore: Firestore,
    private shp: SnackbarHorizPosService,
    private ngxLoader: NgxUiLoaderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.filteredCourses = this.courseCtrl.valueChanges.pipe(
      startWith(null),
      map((s: string | null) =>
        s
          ? this.courses.all.filter((course) =>
              course.toLowerCase().includes(s.toLowerCase().trim())
            )
          : this.courses.all.slice()
      )
    );
  }

  async ngOnInit() {
    try {
      this.ngxLoader.start();
      if (this.auth.currentUser !== null) {
        const fUser = await getDoc(
          doc(this.firestore, `/users/${this.auth.currentUser.uid}`)
        );
        if (fUser.exists()) {
          this.selectedCourses = fUser.get('tutorInfo.courses') ?? [];
        }
        this.sessions = (
          await getDocs(
            query(
              collection(this.firestore, 'sessions').withConverter(
                Session.converter
              ),
              where('tutor.id', '==', this.auth.currentUser.uid),
              where('status', '==', 'pending'),
              where('start', '>=', Timestamp.fromDate(new Date())),
              orderBy('start', 'asc')
            )
          )
        ).docs.map((d) => d.data());
      } else {
        this.router.navigateByUrl('/sign-in');
      }
    } catch (error: any) {
      this.snackBar.open(error.message, '', {
        panelClass: ['snackbar-error'],
        horizontalPosition: this.shp.value
      });
    } finally {
      this.ngxLoader.stop();
    }
  }

  optionClicked(event: Event, course: string) {
    if (event) event.stopPropagation();
    this.toggleSelection(course);
  }

  async saveCourses() {
    if (this.selectedCourses.length === 0) {
      this.snackBar.open('Please add at least one course.', '', {
        panelClass: ['snackbar-error'],
        horizontalPosition: this.shp.value
      });
      return;
    } else if (this.auth.currentUser === null) {
      this.router.navigateByUrl('/sign-in');
      this.snackBar.open('You should be logged in', '', {
        panelClass: ['snackbar-error'],
        horizontalPosition: this.shp.value
      });
    } else {
      try {
        this.ngxLoader.start();
        await setDoc(
          doc(this.firestore, `/users/${this.auth.currentUser.uid}`),
          { tutorInfo: { courses: this.selectedCourses } },
          { merge: true }
        );
        this.snackBar.open('Courses updated successfully.', '', {
          panelClass: ['snackbar-success'],
          horizontalPosition: this.shp.value
        });
      } catch (error: any) {
        this.snackBar.open(error.message, '', {
          panelClass: ['snackbar-error'],
          horizontalPosition: this.shp.value
        });
      } finally {
        this.ngxLoader.stop();
      }
    }
  }

  toggleSelection(course: string) {
    if (!this.selectedCourses.includes(course)) {
      this.selectedCourses.push(course);
    } else {
      const i = this.selectedCourses.findIndex(
        (value) => value.toLowerCase() === course.toLowerCase()
      );
      this.selectedCourses.splice(i, 1);
    }
  }

  async manageSession(session: Session, status: SessionStatus) {
    const dialogRef = this.dialog.open(ConfirmManageSessionDialog, {
      closeOnNavigation: false,
      data: status,
      maxWidth: 384
    });
    const result = await firstValueFrom(dialogRef.afterClosed());
    if (result) {
      if (this.auth.currentUser != null) {
        try {
          this.ngxLoader.start();
          await setDoc(
            doc(this.firestore, `/sessions/${session.id}`),
            {
              status
            },
            { merge: true }
          );
          const { start, end } = session;
          await setDoc(
            doc(this.firestore, `/users/${this.auth.currentUser.uid}`),
            {
              schedules: arrayUnion({
                start: Timestamp.fromDate(start),
                end: Timestamp.fromDate(end)
              })
            },
            { merge: true }
          );
          this.snackBar.open('Session updated successfully.', '', {
            panelClass: ['snackbar-success'],
            horizontalPosition: this.shp.value
          });
          window.location.reload();
        } catch (error: any) {
          this.snackBar.open(error.message, '', {
            panelClass: ['snackbar-error'],
            horizontalPosition: this.shp.value
          });
          this.ngxLoader.stop();
        }
      } else {
        this.router.navigateByUrl('/sign-in');
      }
    }
  }
}

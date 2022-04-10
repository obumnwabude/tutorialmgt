import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  addDoc,
  collection,
  Firestore,
  Timestamp
} from '@angular/fire/firestore';
import {
  Functions,
  HttpsCallable,
  httpsCallable
} from '@angular/fire/functions';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { firstValueFrom } from 'rxjs';

import { Person } from '../../models/person.model';
import { Session } from '../../models/session.model';
import { CoursesService } from '../../services/courses.service';
import { SnackbarHorizPosService } from '../../services/snackbar-horiz-pos.service';
import { CloseSchedulerDialog } from '../close-scheduler-dialog';

interface TutorRequest {
  course: string;
  start: Timestamp;
  end: Timestamp;
}

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss']
})
export class SchedulerComponent implements OnInit {
  getTutors: HttpsCallable<TutorRequest, Person[]>;
  isGettingTutors = false;
  minDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  startDate = new FormControl(null, Validators.required);
  startTime = new FormControl(null, Validators.required);
  endDate = new FormControl(null, Validators.required);
  endTime = new FormControl(null, [
    Validators.required,
    this._validateEndTime.bind(this)
  ]);
  course = new FormControl(null, Validators.required);
  tutor = new FormControl(null, Validators.required);
  session = new FormGroup({
    startDate: this.startDate,
    startTime: this.startTime,
    endDate: this.endDate,
    endTime: this.endTime,
    course: this.course,
    tutor: this.tutor
  });
  tutors: Person[] = [];
  @Output() cancel = new EventEmitter<boolean>();

  constructor(
    private auth: Auth,
    public courses: CoursesService,
    public dialog: MatDialog,
    private firestore: Firestore,
    fns: Functions,
    private shp: SnackbarHorizPosService,
    private ngxLoader: NgxUiLoaderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.getTutors = httpsCallable(fns, 'getTutors');
    this.minDate.setHours(0, 0, 0, 0);
  }

  async ngOnInit() {
    const courses = await firstValueFrom(this.courses.all);
    if (courses.length > 0) this.course.setValue(courses[0]);
  }

  async openCloseDialog() {
    const dialogRef = this.dialog.open(CloseSchedulerDialog, {
      closeOnNavigation: false,
      maxWidth: 384
    });
    const result = await firstValueFrom(dialogRef.afterClosed());
    if (result) this.cancel.emit();
  }

  private _getFormValidationErrors(): any[] {
    const result: any[] = [];
    Object.keys(this.session.controls).forEach((key) => {
      const controlErrors = this.session.get(key)?.errors;
      if (controlErrors) {
        Object.keys(controlErrors).forEach((keyError) => {
          result.push({
            control: key,
            error: keyError,
            value: controlErrors[keyError]
          });
        });
      }
    });
    return result;
  }

  async tappedField() {
    const errors = this._getFormValidationErrors();
    if (
      errors.length === 0 ||
      (errors.length === 1 && errors[0].control === 'tutor')
    ) {
      return this.fetchTutors();
    }
  }

  async tappedTutorDropdown() {
    if (this.tutors.length > 0) return;
    else return this.fetchTutors();
  }

  async fetchTutors() {
    const errors = this._getFormValidationErrors();
    if (
      this.session.invalid &&
      (errors.length > 1 ||
        !(errors.length === 1 && errors[0].control === 'tutor'))
    ) {
      let message = 'Please resolve all errors above before proceeding.';
      if (
        errors.map((e) => e.error).filter((e) => e === 'required').length ===
        errors.length
      ) {
        message = 'Please first fill all the above fields.';
      }
      this.snackBar.open(message, '', {
        panelClass: ['snackbar-error'],
        horizontalPosition: this.shp.value
      });
    } else if (!this.auth.currentUser) {
      this.router.navigateByUrl('/sign-in');
    } else {
      const dates = this._mergeDates();
      const start = Timestamp.fromDate(dates.start);
      const end = Timestamp.fromDate(dates.end);
      const course = this.course.value;
      try {
        this.snackBar.open('Fetching Tutors, please wait ...', '', {
          panelClass: ['snackbar-success'],
          horizontalPosition: this.shp.value
        });
        this.isGettingTutors = true;
        this.tutors = (await this.getTutors({ course, start, end })).data;
        if (this.tutors.length > 0) {
          this.snackBar.open('Fetched tutors, kindly select one.', '', {
            panelClass: ['snackbar-success'],
            horizontalPosition: this.shp.value
          });
          this.tutor.setValue(this.tutors[0]);
        } else {
          this.snackBar.open(
            "Couldn't find an available tutor for the time frame you are booking. Consider changing the time frame.",
            '',
            {
              panelClass: ['snackbar-error'],
              horizontalPosition: this.shp.value
            }
          );
        }
      } catch (error: any) {
        this.snackBar.open(error.message, '', {
          panelClass: ['snackbar-error'],
          horizontalPosition: this.shp.value
        });
      } finally {
        this.isGettingTutors = false;
      }
    }
  }

  private _validateEndTime(end: AbstractControl) {
    const startDate = this.startDate.value;
    const endDate = this.endDate.value;
    if (startDate && endDate && endDate?.getTime() === startDate?.getTime()) {
      const startTime = this.startTime.value;
      const endTime = end.value;
      if (startTime && endTime) {
        const [startHours, startMins] = this.startTime.value
          .split(':')
          .map((m: string) => Number(m));
        const [endHours, endMins] = this.endTime.value
          .split(':')
          .map((m: string) => Number(m));
        if (endHours < startHours) {
          return { less: true };
        } else if (endHours === startHours) {
          if (endMins <= startMins) return { less: true };
        }
      }
    }
    return null;
  }

  private _mergeDates(): { start: Date; end: Date } {
    const start = this.startDate.value as Date;
    const end = this.endDate.value as Date;
    const [startHours, startMins] = this.startTime.value.split(':');
    const [endHours, endMins] = this.endTime.value.split(':');
    start.setHours(startHours, startMins);
    end.setHours(endHours, endMins);
    return { start, end };
  }

  private _constructSession(): Session {
    const { start, end } = this._mergeDates();
    const { course, tutor } = this.session.value;
    if (this.auth.currentUser) {
      const { displayName, email, uid } = this.auth.currentUser;
      const student: Person = {
        email: email ?? '',
        id: uid,
        name: displayName ?? ''
      };
      return new Session(course, end, '', start, 'pending', student, tutor);
    } else {
      throw this.router.navigateByUrl('/sign-in');
    }
  }

  async saveSession() {
    if (this.session.invalid) {
      const errors = this._getFormValidationErrors();
      if (
        errors.length === 0 ||
        (errors.length === 1 && errors[0].control === 'tutor')
      ) {
        this.snackBar.open('Please wait while we fetch tutors', '', {
          panelClass: ['snackbar-success'],
          horizontalPosition: this.shp.value
        });
        if (!this.isGettingTutors) this.fetchTutors();
      } else {
        this.snackBar.open('Please resolve all errors', '', {
          panelClass: ['snackbar-error'],
          horizontalPosition: this.shp.value
        });
      }
    } else {
      try {
        this.ngxLoader.start();
        await addDoc(
          collection(this.firestore, 'sessions').withConverter(
            Session.converter
          ),
          this._constructSession()
        );
        this.snackBar.open('Session successfully saved', '', {
          panelClass: ['snackbar-success'],
          horizontalPosition: this.shp.value
        });
        this.cancel.emit();
      } catch (error: any) {
        console.error(error);
        this.snackBar.open(error.message, '', {
          panelClass: ['snackbar-error'],
          horizontalPosition: this.shp.value
        });
      } finally {
        this.ngxLoader.stop();
      }
    }
  }
}

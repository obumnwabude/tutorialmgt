import { Component, EventEmitter, Output } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgxUiLoaderService, Time } from 'ngx-ui-loader';
import { CoursesService } from '../services/courses.service';
import { Session } from '../session';

interface Tutor {
  id: string;
  name: string;
}

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
export class SchedulerComponent {
  getTutors: HttpsCallable<TutorRequest, Tutor[]>;
  isGettingTutors = false;
  minDate = new Date();
  startDate = new FormControl(null, Validators.required);
  startTime = new FormControl(null, Validators.required);
  endDate = new FormControl(null, [Validators.required]);
  endTime = new FormControl(null, [
    Validators.required,
    this._validateEndTime.bind(this)
  ]);
  course = new FormControl(this.courses.all[0], Validators.required);
  tutorId = new FormControl(null, Validators.required);
  session = new FormGroup({
    startDate: this.startDate,
    startTime: this.startTime,
    endDate: this.endDate,
    endTime: this.endTime,
    course: this.course,
    tutorId: this.tutorId
  });
  tutors: Tutor[] = [];
  @Output() cancel = new EventEmitter<boolean>();

  constructor(
    private auth: Auth,
    public courses: CoursesService,
    private firestore: Firestore,
    fns: Functions,
    private ngxLoader: NgxUiLoaderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.getTutors = httpsCallable(fns, 'getTutors');
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

  async fetchTutors() {
    if (this.tutors.length > 0) return;
    const errors = this._getFormValidationErrors();
    if (
      errors.length > 1 ||
      !(errors.length === 1 && errors[0].control === 'tutorId')
    ) {
      let message = 'Please resolve all errors above before proceeding.';
      if (
        errors.map((e) => e.error).filter((e) => e === 'required').length ===
        errors.length
      ) {
        message = 'Please first fill all the above fields.';
      }
      this.snackBar.open(message, '', {
        panelClass: ['snackbar-error']
      });
    } else if (!this.auth.currentUser) {
      this.router.navigateByUrl('/sign-in');
    } else {
      const dates = this._mergeDates();
      const start = Timestamp.fromDate(dates.start);
      const end = Timestamp.fromDate(dates.end);
      const course = this.course.value;
      try {
        this.snackBar.open('Fetching Tutors ...', '', {
          panelClass: ['snackbar-success']
        });
        this.isGettingTutors = true;
        this.tutors = (await this.getTutors({ course, start, end })).data;
        this.snackBar.open('Fetched tutors, kindly select one.', '', {
          panelClass: ['snackbar-success']
        });
      } catch (error: any) {
        this.snackBar.open(error.message, '', {
          panelClass: ['snackbar-error']
        });
      } finally {
        this.isGettingTutors = false;
      }
    }
  }

  private _validateEndTime(end: AbstractControl) {
    const startDate = this != undefined ? this.startDate?.value : null;
    const endDate = this != undefined ? this.endDate?.value : null;
    if (startDate && endDate && endDate?.getTime() === startDate?.getTime()) {
      const startTime = this.startTime?.value;
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
    const { course, tutorId } = this.session.value;
    let authorId = '';
    if (this.auth.currentUser) authorId = this.auth.currentUser.uid;
    else this.router.navigateByUrl('/sign-in');
    return new Session(authorId, course, end, start, 'pending', tutorId);
  }

  async saveSession(e: any): Promise<void> {
    if (this.session.invalid) {
      const errors = this._getFormValidationErrors();
      if (
        errors.length > 1 ||
        !(errors.length === 1 && errors[0].control === 'tutorId')
      ) {
        this.snackBar.open('Please resolve all errors', '', {
          panelClass: ['snackbar-error']
        });
      } else {
        this.snackBar.open('Please wait while we fetch tutors', '', {
          panelClass: ['snackbar-success']
        });
        if (!this.isGettingTutors) this.fetchTutors();
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
          panelClass: ['snackbar-success']
        });
        e.target.reset();
        this.session.reset();
        this.cancel.emit();
      } catch (error: any) {
        console.error(error);
        this.snackBar.open(error.message, '', {
          panelClass: ['snackbar-error']
        });
      } finally {
        this.ngxLoader.stop();
      }
    }
  }
}
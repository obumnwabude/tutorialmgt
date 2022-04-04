import { Component, EventEmitter, Output } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CoursesService } from '../services/courses.service';
import { Session } from '../session';

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss']
})
export class SchedulerComponent {
  minDate = new Date();
  startDate = new FormControl(null, Validators.required);
  startTime = new FormControl(null, Validators.required);
  endDate = new FormControl(null, [Validators.required]);
  endTime = new FormControl(null, [
    Validators.required,
    this._validateEndTime.bind(this)
  ]);
  session = this.fb.group({
    startDate: this.startDate,
    startTime: this.startTime,
    endDate: this.endDate,
    endTime: this.endTime,
    course: [this.courses.all[0], Validators.required],
    tutorId: ['teacher', Validators.required]
  });
  @Output() cancel = new EventEmitter<boolean>();

  constructor(
    private auth: Auth,
    private courses: CoursesService,
    private fb: FormBuilder,
    private firestore: Firestore,
    private ngxLoader: NgxUiLoaderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

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

  private _constructSession(): Session {
    const start = this.startDate.value as Date;
    const end = this.endDate.value as Date;
    const [startHours, startMins] = this.startTime.value.split(':');
    const [endHours, endMins] = this.endTime.value.split(':');
    start.setHours(startHours, startMins);
    end.setHours(endHours, endMins);
    const { course, tutorId } = this.session.value;
    let authorId = '';
    if (this.auth.currentUser) authorId = this.auth.currentUser.uid;
    else this.router.navigateByUrl('/sign-in');
    return new Session(authorId, course, end, start, 'pending', tutorId);
  }

  async saveSession(e: any): Promise<void> {
    if (this.session.invalid) {
      this.snackBar.open('Please resolve all errors', '', {
        panelClass: ['snackbar-error']
      });
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

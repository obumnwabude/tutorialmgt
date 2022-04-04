import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  templateUrl: './tutor.component.html',
  styleUrls: ['./tutor.component.scss']
})
export class TutorComponent implements OnInit {
  courseCtrl = new FormControl();
  filteredCourses: Observable<string[]>;
  selectedCourses: string[] = [];
  allCourses = ['Physics', 'Maths', 'Chemistry', 'Biology', 'English'];

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private ngxLoader: NgxUiLoaderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.filteredCourses = this.courseCtrl.valueChanges.pipe(
      startWith(null),
      map((v) => {
        if (/^\s*$/.test(v)) {
          this.courseCtrl.setValue('');
          return '';
        } else {
          return v;
        }
      }),
      map((course: string | null) =>
        course
          ? this.allCourses.filter((t) =>
              course.toLowerCase().includes(t.toLowerCase())
            )
          : this.allCourses.slice()
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
      }
    } catch (error: any) {
      this.snackBar.open(error.message, '', { panelClass: 'snackbar-error' });
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
        panelClass: 'snackbar-error'
      });
      return;
    } else if (this.auth.currentUser === null) {
      this.router.navigateByUrl('/sign-in');
      this.snackBar.open('You should be logged in', '', {
        panelClass: 'snackbar-error'
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
          panelClass: 'snackbar-success'
        });
      } catch (error: any) {
        this.snackBar.open(error.message, '', { panelClass: 'snackbar-error' });
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
}

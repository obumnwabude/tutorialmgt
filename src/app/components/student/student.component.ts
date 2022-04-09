import { Component, OnDestroy, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  collection,
  Firestore,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where
} from '@angular/fire/firestore';
import {
  MatBottomSheet,
  MatBottomSheetRef
} from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

import { Session } from '../../models/session.model';
import { SchedulerComponent } from '../scheduler/scheduler.component';
import { IsLargeScreenService } from '../../services/is-large-screen.service';
import { SideSchedulerService } from '../../services/side-scheduler.service';
import { SnackbarHorizPosService } from '../../services/snackbar-horiz-pos.service';
import { StudentComponentService } from '../../services/student-component.service';

@Component({
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss']
})
export class StudentComponent implements OnDestroy, OnInit {
  bsRef!: MatBottomSheetRef<SchedulerComponent>;
  isFetchingSessions = true;
  isLargeScreen!: boolean;
  sessions: Session[] = [];

  constructor(
    private auth: Auth,
    private bs: MatBottomSheet,
    private firestore: Firestore,
    private _isLargeScreen: IsLargeScreenService,
    private sideScheduler: SideSchedulerService,
    private shp: SnackbarHorizPosService,
    private snackBar: MatSnackBar,
    private _studentComponent: StudentComponentService
  ) {
    this._isLargeScreen.value.subscribe((v) => (this.isLargeScreen = v));
    this._studentComponent.value = this;
  }

  ngOnDestroy() {
    this._studentComponent.value = null;
  }

  async ngOnInit() {
    if (this.auth.currentUser != null) {
      try {
        this.sessions = (
          await getDocs(
            query(
              collection(this.firestore, 'sessions').withConverter(
                Session.converter
              ),
              where('student.id', '==', this.auth.currentUser.uid),
              where('status', '==', 'accepted'),
              where('start', '>=', Timestamp.fromDate(new Date())),
              orderBy('start', 'asc')
            )
          )
        ).docs.map((d) => d.data());
      } catch (error: any) {
        this.snackBar.open(error.message, '', {
          panelClass: ['snackbar-error'],
          horizontalPosition: this.shp.value
        });
      } finally {
        this.isFetchingSessions = false;
      }
    }
  }

  newSession() {
    if (this.isLargeScreen) {
      this.sideScheduler.value.open();
    } else {
      this.bsRef = this.bs.open(SchedulerComponent, {
        closeOnNavigation: false,
        disableClose: true
      });
      const closeSub = this.bsRef.instance.cancel.subscribe((_) =>
        this.bsRef.dismiss()
      );
      firstValueFrom(this.bsRef.afterDismissed()).then(() =>
        closeSub.unsubscribe()
      );
    }
  }
}

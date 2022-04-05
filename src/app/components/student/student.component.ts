import { Component, OnDestroy } from '@angular/core';
import {
  MatBottomSheet,
  MatBottomSheetRef
} from '@angular/material/bottom-sheet';
import { firstValueFrom } from 'rxjs';

import { SchedulerComponent } from '../scheduler/scheduler.component';
import { IsLargeScreenService } from '../../services/is-large-screen.service';
import { SideSchedulerService } from '../../services/side-scheduler.service';
import { StudentComponentService } from '../../services/student-component.service';

@Component({
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss']
})
export class StudentComponent implements OnDestroy {
  bsRef!: MatBottomSheetRef<SchedulerComponent>;
  isLargeScreen!: boolean;
  constructor(
    private bs: MatBottomSheet,
    private _isLargeScreen: IsLargeScreenService,
    private sideScheduler: SideSchedulerService,
    private _studentComponent: StudentComponentService
  ) {
    this._isLargeScreen.value.subscribe((v) => {
      v ? this.bsRef?.dismiss() : this.sideScheduler.value.close();
      this.isLargeScreen = v;
    });
    this._studentComponent.value = this;
  }

  ngOnDestroy() {
    this._studentComponent.value = null;
  }

  newSession() {
    if (this.isLargeScreen) {
      this.sideScheduler.value.open();
    } else {
      this.bsRef = this.bs.open(SchedulerComponent);
      const closeSub = this.bsRef.instance.cancel.subscribe((_) =>
        this.bsRef.dismiss()
      );
      firstValueFrom(this.bsRef.afterDismissed()).then(() =>
        closeSub.unsubscribe()
      );
    }
  }
}

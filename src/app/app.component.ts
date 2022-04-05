import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { MatSidenav } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { SPINNER } from 'ngx-ui-loader';
import { filter } from 'rxjs/operators';

import { IsLargeScreenService } from './services/is-large-screen.service';
import { SideSchedulerService } from './services/side-scheduler.service';
import { StudentComponentService } from './services/student-component.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  isLargeScreen!: boolean;
  // the 500 level of mat light blue palette
  primaryColor = '#03A9F4';
  SPINNER = SPINNER;
  @ViewChild('snav') snav!: MatSidenav;
  @ViewChild('sideScheduler') private _sideScheduler!: MatSidenav;
  year = new Date().getFullYear();

  constructor(
    public auth: Auth,
    private _isLargeScreen: IsLargeScreenService,
    private router: Router,
    private sideScheduler: SideSchedulerService,
    private studentComponent: StudentComponentService
  ) {
    this._isLargeScreen.value.subscribe((l) => (this.isLargeScreen = l));
  }

  ngAfterViewInit(): void {
    this.sideScheduler.value = this._sideScheduler;
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        if (!this.isLargeScreen && this.auth.currentUser) this.snav?.close();
      });
  }

  async newSession() {
    await this.router.navigateByUrl('/student');
    this.studentComponent.value?.newSession();
  }

  async signOut() {
    await this.auth.signOut();
    this.router.navigateByUrl('/sign-in');
  }
}

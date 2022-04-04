import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { SPINNER } from 'ngx-ui-loader';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLargeScreen = false;
  // the 500 level of mat light blue palette
  primaryColor = '#03A9F4';
  SPINNER = SPINNER;
  @ViewChild('snav') snav!: MatSidenav;
  year = new Date().getFullYear();

  constructor(
    public auth: Auth,
    private breakpoint: BreakpointObserver,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.breakpoint
      .observe('(min-width: 768px)')
      .subscribe((b) => (this.isLargeScreen = b.matches));
  }

  async signOut() {
    await this.auth.signOut();
    this.router.navigateByUrl('/sign-in');
  }
}

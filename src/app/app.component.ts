import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { SPINNER } from 'ngx-ui-loader';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // the 500 level of mat light blue palette
  primaryColor = '#03A9F4';
  SPINNER = SPINNER;

  constructor(private auth: Auth, private router: Router) { }

  async signOut() {
    await this.auth.signOut();
    this.router.navigateByUrl('/sign-in');
  }
}

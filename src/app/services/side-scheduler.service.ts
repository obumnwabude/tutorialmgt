import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Injectable({
  providedIn: 'root'
})
export class SideSchedulerService {
  private _value!: MatSidenav;

  public get value(): MatSidenav {
    return this._value;
  }
  
  public set value(value: MatSidenav) {
    this._value = value;
  }
}

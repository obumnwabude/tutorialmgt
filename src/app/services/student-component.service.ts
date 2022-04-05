import { Injectable } from '@angular/core';
import { StudentComponent } from '../components/student/student.component';

@Injectable({
  providedIn: 'root'
})
export class StudentComponentService {
  private _value!: StudentComponent | null;

  public get value(): StudentComponent | null {
    return this._value;
  }

  public set value(value: StudentComponent | null) {
    this._value = value;
  }
}

import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IsLargeScreenService {
  constructor(private breakpoint: BreakpointObserver) {}

  value = this.breakpoint
    .observe('(min-width: 768px)')
    .pipe(map((b) => b.matches));
}

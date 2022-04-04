import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  all = ['Physics', 'Maths', 'Chemistry', 'Biology', 'English'];
}

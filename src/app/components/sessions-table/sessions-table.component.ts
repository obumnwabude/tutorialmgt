import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Session } from '../../models/session.model';

@Component({
  selector: 'app-sessions-table',
  templateUrl: './sessions-table.component.html',
  styleUrls: ['./sessions-table.component.scss']
})
export class SessionsTableComponent implements OnInit {
  @Input() hideStudent = false;
  @Input() hideTutor = false;
  @Input() isTutorManaging = false;
  @Input() sessions: Session[] = [];
  columnsToDisplay: string[] = [];
  @Output() accept = new EventEmitter<Session>();
  @Output() reject = new EventEmitter<Session>();

  constructor(private snackbar: MatSnackBar) {}

  ngOnInit() {
    this.columnsToDisplay = [
      ...(this.isTutorManaging ? ['manage'] : []),
      'course',
      ...(this.hideStudent ? [] : ['student']),
      ...(this.hideTutor ? [] : ['tutor']),
      'start-date',
      'start-time',
      'end-date',
      'end-time'
    ];
  }

  copyFeedback(): void {
    this.snackbar.open('Email copied to clipboard', '', {
      panelClass: ['snackbar-success']
    });
  }
}

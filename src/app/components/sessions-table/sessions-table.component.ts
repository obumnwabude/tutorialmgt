import { Component, Input, OnInit } from '@angular/core';

import { Session } from '../../models/session.model';

@Component({
  selector: 'app-sessions-table',
  templateUrl: './sessions-table.component.html',
  styleUrls: ['./sessions-table.component.scss']
})
export class SessionsTableComponent implements OnInit {
  @Input() hideStudent = false;
  @Input() hideTutor = false;
  @Input() sessions: Session[] = [];
  columnsToDisplay: string[] = [];

  ngOnInit() {
    this.columnsToDisplay = [
      'course',
      ...(this.hideStudent ? [] : ['student']),
      ...(this.hideTutor ? [] : ['tutor']),
      'start-date',
      'start-time',
      'end-date',
      'end-time'
    ];
  }
}

import { Component, Input } from '@angular/core';

import { Session } from '../../models/session.model';

@Component({
  selector: 'app-sessions-table',
  templateUrl: './sessions-table.component.html',
  styleUrls: ['./sessions-table.component.scss']
})
export class SessionsTableComponent {
  columnsToDisplay = [
    'course',
    'tutor',
    'start-date',
    'start-time',
    'end-date',
    'end-time'
  ];
  @Input() sessions: Session[] = [];
}

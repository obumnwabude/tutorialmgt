import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  collection,
  Firestore,
  FirestoreError,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  Unsubscribe,
  where
} from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Session } from '../../models/session.model';
import { SnackbarHorizPosService } from '../../services/snackbar-horiz-pos.service';

@Component({
  templateUrl: './sessions-list.component.html',
  styleUrls: ['./sessions-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SessionsListComponent implements OnInit {
  isFetchingSessions = true;
  sessions: Session[] = [];
  sessionsUnsub!: Unsubscribe;
  tabs = [
    {
      icon: 'verified',
      title: 'Upcoming',
      queries: [
        where('status', '==', 'accepted'),
        where('start', '>=', Timestamp.fromDate(new Date()))
      ]
    },
    {
      icon: 'hourglass_empty',
      title: 'Pending',
      queries: [
        where('status', '==', 'pending'),
        where('start', '>=', Timestamp.fromDate(new Date()))
      ]
    },
    {
      icon: 'thumb_down',
      title: 'Rejected',
      queries: [
        where('status', '==', 'rejected'),
        where('start', '>=', Timestamp.fromDate(new Date()))
      ]
    },
    {
      icon: 'history',
      title: 'Past',
      queries: [where('start', '<', Timestamp.fromDate(new Date()))]
    }
  ];

  set focusedTabIndex(i: number) {
    localStorage.setItem('student_sessions_tab', `${i}`);
  }

  get focusedTabIndex(): number {
    const n = localStorage.getItem('student_sessions_tab');
    return !Number.isNaN(n) ? Number(n) : 0;
  }

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private shp: SnackbarHorizPosService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.assignSessionsUnsub();
  }

  assignSessionsUnsub() {
    if (this.auth.currentUser != null) {
      this.sessionsUnsub = onSnapshot(
        query(
          collection(this.firestore, 'sessions').withConverter(
            Session.converter
          ),
          where('student.id', '==', this.auth.currentUser.uid),
          ...this.tabs[this.focusedTabIndex].queries,
          orderBy('start', 'asc')
        ),
        {
          next: (snap) => {
            this.sessions = snap.docs.map((d) => d.data());
            this.isFetchingSessions = false;
          },
          error: (error: FirestoreError) => {
            this.snackBar.open(error.message, '', {
              panelClass: ['snackbar-error'],
              horizontalPosition: this.shp.value
            });
            this.isFetchingSessions = false;
          }
        }
      );
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  fetchSessions() {
    this.sessionsUnsub();
    this.sessions = [];
    this.isFetchingSessions = true;
    this.assignSessionsUnsub();
  }
}

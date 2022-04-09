import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  collection,
  Firestore,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where
} from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { Session } from '../../models/session.model';
import { SnackbarHorizPosService } from '../../services/snackbar-horiz-pos.service';

enum ListType {
  student,
  tutor
}

@Component({
  templateUrl: './sessions-list.component.html',
  styleUrls: ['./sessions-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SessionsListComponent implements OnInit {
  isFetchingSessions = true;
  sessions: Session[] = [];
  listType: ListType;
  ListType = ListType;
  studentTabs = [
    {
      icon: 'cloud_sync',
      title: 'Pending',
      queries: [
        where('status', '==', 'pending'),
        where('start', '>=', Timestamp.fromDate(new Date()))
      ]
    },
    {
      icon: 'verified',
      title: 'Upcoming',
      queries: [
        where('status', '==', 'accepted'),
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
  tutorTabs = [
    {
      icon: 'thumb_up',
      title: 'Upcoming',
      queries: [
        where('status', '==', 'accepted'),
        where('start', '>=', Timestamp.fromDate(new Date()))
      ]
    },
    {
      icon: 'add_task',
      title: 'Requested',
      queries: [
        where('status', '==', 'pending'),
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
    localStorage.setItem(
      `${
        this.listType === ListType.student ? 'student' : 'tutor'
      }-sessions-tab`,
      `${i}`
    );
  }

  get focusedTabIndex(): number {
    const n = localStorage.getItem(
      `${this.listType === ListType.student ? 'student' : 'tutor'}-sessions-tab`
    );
    return !Number.isNaN(n) ? Number(n) : 0;
  }

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private shp: SnackbarHorizPosService,
    private snackBar: MatSnackBar
  ) {
    const urlParts = this.router.url.split('/');
    this.listType =
      urlParts[urlParts.length - 1] == 'student'
        ? ListType.student
        : ListType.tutor;
  }

  async ngOnInit() {
    this.fetchSessions();
  }

  async fetchSessions() {
    if (this.auth.currentUser != null) {
      try {
        this.sessions = [];
        this.isFetchingSessions = true;
        this.sessions = (
          await getDocs(
            query(
              collection(this.firestore, 'sessions').withConverter(
                Session.converter
              ),
              ...(this.listType === ListType.student
                ? [where('student.id', '==', this.auth.currentUser.uid)]
                : [where('tutor.id', '==', this.auth.currentUser.uid)]),
              ...this.studentTabs[this.focusedTabIndex].queries,
              orderBy('start', 'asc')
            )
          )
        ).docs.map((d) => d.data());
      } catch (error: any) {
        this.snackBar.open(error.message, '', {
          panelClass: ['snackbar-error'],
          horizontalPosition: this.shp.value
        });
      } finally {
        this.isFetchingSessions = false;
      }
    } else {
      this.router.navigateByUrl('/sign-in');
    }
  }
}

import {
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp
} from '@angular/fire/firestore';

import { Person } from './person.model';

export type SessionStatus = 'accepted' | 'pending' | 'rejected';

export class Session {
  constructor(
    public course: string,
    public end: Date,
    public id: string,
    public start: Date,
    public status: SessionStatus,
    public student: Person,
    public tutor: Person
  ) {}

  static fromJSON(json: any): Session {
    return new Session(
      json['course'],
      json['end'].toDate(),
      json['id'],
      json['start'].toDate(),
      json['status'],
      json['student'],
      json['tutor']
    );
  }

  static toJSON(Session: Session) {
    const { course, end, id, start, status, student, tutor } = Session;
    return {
      course,
      end: Timestamp.fromDate(end),
      id,
      start: Timestamp.fromDate(start),
      status,
      student,
      tutor
    };
  }

  static converter = {
    toFirestore: this.toJSON,
    fromFirestore: (
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): Session => this.fromJSON(snapshot.data(options))
  };
}

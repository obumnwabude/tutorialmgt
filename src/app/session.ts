import {
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp
} from '@angular/fire/firestore';

export type SessionStatus = 'accepted' | 'pending' | 'rejected';

export interface Person {
  id: string;
  email: string;
  name: string;
}

export class Session {
  constructor(
    public course: string,
    public end: Date,
    public start: Date,
    public status: SessionStatus,
    public student: Person,
    public tutor: Person
  ) {}

  static fromJSON(json: any): Session {
    return new Session(
      json['course'],
      json['end'].toDate(),
      json['start'].toDate(),
      json['status'],
      json['student'],
      json['tutor']
    );
  }

  static toJSON(Session: Session) {
    const { course, end, start, status, student, tutor } = Session;
    return {
      course,
      end: Timestamp.fromDate(end),
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

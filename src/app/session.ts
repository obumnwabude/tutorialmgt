import {
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp
} from '@angular/fire/firestore';

type SessionStatus = 'accepted' | 'pending' | 'rejected';

export class Session {
  constructor(
    public authorId: string,
    public course: string,
    public end: Date,
    public start: Date,
    public status: SessionStatus,
    public tutorId: string
  ) {}

  static fromJSON(json: any): Session {
    return new Session(
      json['authorId'],
      json['course'],
      json['end'].toDate(),
      json['start'].toDate(),
      json['status'],
      json['tutorId']
    );
  }

  static toJSON(Session: Session) {
    const { authorId, end, course, start, status, tutorId } = Session;
    return {
      authorId,
      end: Timestamp.fromDate(end),
      course,
      start: Timestamp.fromDate(start),
      status,
      tutorId
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

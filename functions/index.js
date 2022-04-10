const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.createFirestoreUser = functions.auth
  .user()
  .onCreate(async (authUser) => {
    await db
      .doc('/users/counter')
      .set({ count: admin.firestore.FieldValue.increment(1) }, { merge: true })
      .catch((error) => console.error(error));

    await db
      .doc(`/users/${authUser.uid}`)
      .set(
        { authInfo: { email: authUser.email, uid: authUser.uid } },
        { merge: true }
      )
      .catch((error) => console.error(error));
  });

exports.deleteFirestoreUser = functions.auth
  .user()
  .onDelete(async (authUser) => {
    await db
      .doc('/users/counter')
      .set({ count: admin.firestore.FieldValue.increment(-1) }, { merge: true })
      .catch((error) => console.error(error));

    await db
      .doc(`/users/${authUser.uid}`)
      .delete()
      .catch((error) => console.error(error));
  });

exports.createSession = functions.firestore
  .document('/sessions/{sessionId}')
  .onCreate(async (_, context) => {
    await db
      .doc(`/sessions/${context.params['sessionId']}`)
      .update({ id: context.params['sessionId'] })
      .catch((error) => console.error(error));

    await db
      .doc('/sessions/counter')
      .set({ count: admin.firestore.FieldValue.increment(1) }, { merge: true })
      .catch((error) => console.error(error));
  });

exports.reduceSessionCount = functions.firestore
  .document('/sessions/{sessionId}')
  .onDelete(
    async (_, __) =>
      await db
        .doc('/sessions/counter')
        .set(
          { count: admin.firestore.FieldValue.increment(-1) },
          { merge: true }
        )
        .catch((error) => console.error(error))
  );

exports.getTutors = functions.https.onCall(async (data, context) => {
  if (!data.course) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Please provide the course to get tutors for.'
    );
  } else if (
    !data.start ||
    !('seconds' in data.start && 'nanoseconds' in data.start)
  ) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Please provide start, it should be a Timestamp.'
    );
  } else if (
    !data.end ||
    !('seconds' in data.end && 'nanoseconds' in data.end)
  ) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Please provide end, it should be a Timestamp.'
    );
  } else if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Please sign in first.'
    );
  }

  return (
    await admin
      .firestore()
      .collection('users')
      .where('tutorInfo.courses', 'array-contains', data.course)
      .limit(100)
      .get()
  ).docs
    .map((d) => {
      const { displayName, email, uid } = d.data().authInfo;
      return { id: uid, email, name: displayName ?? '' };
    })
    .filter((d) => d.id !== context.auth.uid);
});

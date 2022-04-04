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

exports.increaseSessionCount = functions.firestore
  .document('/sessions/{sessionId}')
  .onCreate(
    async (_, __) =>
      await db
        .doc('/sessions/counter')
        .set(
          { count: admin.firestore.FieldValue.increment(1) },
          { merge: true }
        )
        .catch((error) => console.error(error))
  );

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

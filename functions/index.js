const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

//auth trigger, must return promise/value
exports.newUserSignup = functions.auth.user().onCreate(user => {
    admin.firestore().collection('users').doc(user.uid).set({
        email: user.email,
        upvotedOn: []
    });
});
//auth trigger , user deleted
exports.userDeleted = functions.auth.user().onDelete(user => {

    return admin.firestore().collection('users').doc(user.uid).delete();
});

exports.addRequest = functions.https.onCall((data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated', 'Only unauthenticated users can add request'
        );
    }
    if (data.text.length > 30) {
        throw new functions.https.HttpsError(
            'invalid-argument', 'Request must be no more than 30 characters long'
        );
    }
    return admin.firestore().collection('requests').add({
        text: data.text,
        upvotes: 0
    });

});

exports.upvote = functions.https.onCall((data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated', 'Only unauthenticated users can add request'
        );
    }
    const user = admin.firestore().collection('users').doc(context.auth.uid);
    const request = admin.firestore().collection('requests').doc(data.id);
    return user.get().then(doc => {

        if (doc.data().upvotedOn.includes(data.id)) {
            throw new functions.https.HttpsError(
                'failed-precondition', 'You can only upvotes something once'
            );
        }
        //spread the user's upvoted docs. array and add the latest voted request in it
        return user.update({
            upvotedOn: [...doc.data().upvotedOn, data.id]
        })
            .then(() => {
                return request.update({
                    upvotes: admin.firestore.FieldValue.increment(1)
                });
            });
    });
});
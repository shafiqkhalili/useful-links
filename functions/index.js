const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')();

admin.initializeApp();
const db = admin.firestore();

const app = express();

const validateFirebaseIdToken = async (req, res, next) => {
    console.log('Check if request is authorized with Firebase ID token');

    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.');
        res.status(403).send('Unauthorized');
        return;
    }

    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else if (req.cookies) {
        console.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    } else {
        // No cookie
        res.status(403).send('Unauthorized');
        return;
    }

    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        console.log('ID Token correctly decoded', decodedIdToken);
        req.user = decodedIdToken;
        next();
        return;
    } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized');
        return;
    }
};

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors({ origin: ['http://localhost:5000', 'https://useful-links-5c105.web.app'] }));
//Validating user token
app.use(cookieParser);
app.use(validateFirebaseIdToken);

// auth trigger (new user signup)
exports.newUserSignUp = functions.auth.user().onCreate(user => {
    // for background triggers you must return a value/promise
    return db.collection('users').doc(user.uid).set({
        email: user.email
    });
});

// auth trigger (user deleted)
exports.userDeleted = functions.auth.user().onDelete(user => {
    const doc = db.collection('users').doc(user.uid);
    return doc.delete();
});


//Express API

app.get("/", async (req, res) => {
    console.log("Req: ", req.authorization);
    // if (!req.user) {
    //     throw new functions.https.HttpsError(
    //         'unauthenticated',
    //         'only authenticated users can add requests'
    //     );
    // }
    try {
        const snapshot = await db.collection("links").get();

        let links = [];
        snapshot.forEach((doc) => {
            let id = doc.id;
            let data = doc.data();

            links.push({ id, ...data });
        });

        res.status(200).send(links);

    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/:id", async (req, res) => {
    try {
        const snapshot = await db.collection('links').doc(req.params.id).get();

        const userId = snapshot.id;
        const userData = snapshot.data();

        res.status(200).send({ id: userId, ...userData });

    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post("/", async (req, res) => {
    try {
        const link = req.body;

        await db.collection("links").add(link);

        res.status(201).send();

    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.put("/:id", async (req, res) => {
    try {
        const body = req.body;

        await db.collection('links').doc(req.params.id).update(body);

        res.status(200).send();

    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.delete("/:id", async (req, res) => {
    try {

        await db.collection("links").doc(req.params.id).delete();

        res.status(200).send();
    } catch (error) {
        res.status(500).send(error.message);
    }
});

exports.links = functions.https.onRequest(app);

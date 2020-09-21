const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
// const { validateFirebaseIdToken } = require('./validation');

admin.initializeApp();
const db = admin.firestore();

const app = express();
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors({ origin: ['http://localhost:5000', 'https://useful-links-5c105.web.app'] }));
// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "https://useful-links-5c105.web.app");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });
// app.use(validateFirebaseIdToken);

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
    // if (!req.auth) {
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

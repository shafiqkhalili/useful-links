const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')();

admin.initializeApp();

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

app.use(cors({ origin: ['http://localhost:5000', 'https://useful-links-5c105.web.app', 'https://link.shafigh.se'] }));
//Validating user token
app.use(cookieParser);
app.use(validateFirebaseIdToken);

const userCollectionRef = admin.firestore().collection('users');

exports.newUserSignUp = functions.auth.user().onCreate(user => {
    // for background triggers you must return a value/promise
    return userCollectionRef.doc(user.uid).set({
        email: user.email
    });
});


//Express API

app.get("/:uid/links", async (req, res) => {

    try {
        let search = req.query.search || "";
        let orderBy = req.query.orderBy || "title";
        let orderDir = req.query.orderDir || "asc";
        let dataLimit = req.query.limit || 50;
        let lastItem = req.query.lastItem || "";

        let docRef = userCollectionRef.doc(req.params.uid).collection("links");
        if (search !== "" && search !== undefined) {
            console.log("Search word: ", search);
            docRef = docRef.where("title", ">=", search);
        }
        console.log("Limit:", dataLimit);
        docRef = docRef.orderBy(orderBy, orderDir);
        if (lastItem !== "" && lastItem !== undefined) {
            console.log("last item: ", lastItem);
            docRef = docRef.startAfter(lastItem);
        }
        docRef = docRef.limit(parseInt(dataLimit));
        const snapshot = await docRef.get();

        let links = [];
        snapshot.forEach((doc) => {
            let id = doc.id;
            let data = doc.data();

            links.push({ id, ...data });
        });
        if (links.length > 0) {
            res.status(200).send(links);
        } else {
            res.status(404).send(`No data found for ${req.params.uid}!`);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/:uid/links/:docId", async (req, res) => {
    try {
        const snapshot = await userCollectionRef.doc(req.params.uid).collection('links').doc(req.params.docId).get();
        if (snapshot.exists) {
            const userId = snapshot.id;
            const userData = snapshot.data();
            res.status(200).send({ id: userId, ...userData });
        } else {
            res.status(404).send(`Document with id: ${req.params.docId} not found!`);
        }

    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post("/:uid/links", async (req, res) => {
    try {
        const link = req.body;
        if (link.title === "" || link.url === "") {
            res.status(204).send("Title / Url cannot be empty");
        }
        const result = await userCollectionRef.doc(req.params.uid).collection("links").add(link);
        if (result) {
            res.status(201).send(`Documnet created successfully!`);
        } else {
            res.status(404).send(`Document not created! ${result}`);
        }

    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.put("/:uid/links/:docId", async (req, res) => {
    try {
        const body = req.body;

        const result = await userCollectionRef.doc(req.params.uid).collection('links').doc(req.params.docId).update(body);

        if (result) {
            res.status(200).send(`Doc ${req.params.docId} updated successfully!`);
        } else {
            res.status(404).send(`Doc ${req.params.docId} not found! ${result}`);
        }

    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.delete("/:uid/links/:docId", async (req, res) => {
    try {

        const result = await userCollectionRef.doc(req.params.uid).collection("links").doc(req.params.docId).delete();
        if (result) {
            res.status(200).send(`Doc ${req.params.docId} deleted successfully!`);
        } else {
            res.status(404).send(`Doc ${req.params.docId} not found! ${result}`);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

exports.users = functions.https.onRequest(app);

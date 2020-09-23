// Initialize your Web app as described in the Get started for Web
// Firebase previously initialized using firebase.initializeApp().

// const apiUrl = 'http://localhost:5001/useful-links-5c105/us-central1/users/';
const config = {
    userCollection: "https://us-central1-useful-links-5c105.cloudfunctions.net/users",
    linkCollection: "links",
};
const getUserToken = () => {
    return new Promise((resolve, reject) => {

        try {
            const userToken = firebase.auth().currentUser.getIdToken(true);
            if (userToken) {
                resolve(userToken);
            } else {
                showErrorNotification('userToken not fetched');
                reject('Promise rejected!');
            }
        } catch (error) {
            showErrorNotification('userToken not fetched');
            reject('Promise rejected!');
        }
    });
};

const getUserId = () => {
    return new Promise((resolve, reject) => {

        try {
            let user = firebase.auth().currentUser;
            if (user) {
                resolve(user.uid);
            } else {
                showErrorNotification('userToken not fetched');
                reject('Promise rejected!');
            }
        } catch (error) {
            showErrorNotification('uid not fetched');
            reject('Promise rejected!');
        }
    });
};

async function deleteLink(docId) {
    try {
        const userToken = await getUserToken();
        const uid = await getUserId();

        const apiUrl = `${config.userCollection}/${uid}/${config.linkCollection}/${docId}`;
        const response = await fetch(apiUrl, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${userToken}`
            },
        });
        if (response.ok) {
            showSuccessNotification("Link removed!");

            deleteModal.querySelector('.error').textContent = '';
            deleteModal.classList.remove('open');
        } else {

            showErrorNotification("Oops! link not deleted");
        }
    }
    catch (err) {
        showErrorNotification(err);
    }
}

async function addLink(data) {
    try {
        const userToken = await getUserToken();
        const uid = await getUserId();

        const apiUrl = `${config.userCollection}/${uid}/${config.linkCollection}`;
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            linkForm.reset();
            linkForm.querySelector('.error').textContent = '';
            linkModal.classList.remove('open');
        }
    }
    catch (err) {
        showErrorNotification(err);
    }
}

async function updateLink(docId, data) {
    try {
        const userToken = await getUserToken();
        const uid = await getUserId();

        const apiUrl = `${config.userCollection}/${uid}/${config.linkCollection}/${docId}`;

        const response = await fetch(`${apiUrl}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            linkForm.reset();
            linkForm.querySelector('.error').textContent = '';
            linkModal.classList.remove('open');
        } else {
            linkForm.querySelector('.error').textContent = error.message;
        };
    }
    catch (err) {
        showErrorNotification(err);
    }
}
async function getLink(docId) {

    try {
        const userToken = await getUserToken();
        const uid = await getUserId();

        const apiUrl = `${config.userCollection}/${uid}/${config.linkCollection}/${docId}`;
        const response = await fetch(`${apiUrl}`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });
        if (response.ok) {
            return await response.json();
        } else if (response.status === 400) {
            return response('Not found');
        }
    } catch (error) {
        showErrorNotification(error);
    }

}
const getLinks = async (search) => {
    try {
        const userToken = await getUserToken();
        const uid = await getUserId();

        const apiUrl = `${config.userCollection}/${uid}/${config.linkCollection}`;

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (response.ok) {

            const links = await response.json();
            // return links;
            let linksArray = [];
            links.forEach(doc => {
                linksArray.push({ ...doc, id: doc.id });
            });
            return linksArray;
        }
    }
    catch (err) {
        showErrorNotification(err);
    }
};
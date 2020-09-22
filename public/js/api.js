// Initialize your Web app as described in the Get started for Web
// Firebase previously initialized using firebase.initializeApp().

const apiUrl = 'https://us-central1-useful-links-5c105.cloudfunctions.net/links';

const getUserToken = async () => {
    try {
        return await firebase.auth().currentUser.getIdToken(true);
    } catch (error) {
        showErrorNotification(error);
    };
};

const getUserId = async () => {
    try {
        let user = await firebase.auth().currentUser;
        if (user) {
            uid = user.uid;
            console.log("User UID: ", user.uid);
        }
    } catch (error) {
        showErrorNotification(error);
    }
};

async function deleteLink(id) {

    userToken = await getUserToken();
    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: "DELETE",
            headers: {
                'Authorization': userToken
            },
        });

        if (response.ok) {
            showSuccessNotification("Link removed!");
        }
        else {
            showErrorNotification(response.statusText);
        }
    }
    catch (err) {
        showErrorNotification(err);
    }
}

async function addLink(data) {
    userToken = await getUserToken();
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': userToken
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

async function updateLink(id, data) {
    userToken = await getUserToken();
    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                'Authorization': userToken
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
async function getLink(id) {
    userToken = await getUserToken();
    debugger;
    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: "GET",
            headers: {
                'Authorization': userToken
            }
        });

        if (response.ok) {

            return response.json();
        } else {
            linkForm.querySelector('.error').textContent = error.message;
        };
    }
    catch (err) {
        showErrorNotification(err);
    }
}
const getLinks = async () => {
    userToken = await getUserToken();
    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                'Authorization': userToken
            }
        });

        if (response.ok) {
            links = await response.json();
        }
        else {
            showErrorNotification(err);
        }
    }
    catch (err) {
        showErrorNotification(err);
    }
};
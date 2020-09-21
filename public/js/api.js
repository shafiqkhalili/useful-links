const apiUrl = 'https://us-central1-useful-links-5c105.cloudfunctions.net/links';
async function deleteLink(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });

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
async function updateLink(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`);

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
    console.log('updating');
}

async function addLink(data) {
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
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
    try {
        const response = await fetch(`${apiUrl}/${id}`);

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
    try {
        const response = await fetch(apiUrl);

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
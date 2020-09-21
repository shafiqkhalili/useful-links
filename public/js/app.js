

const linkModal = document.querySelector('.link-modal');
const newLinkBtn = document.querySelector('.link-modal-btn');
const linkForm = document.querySelector('.link-modal form');

const openModal = () => {
    linkForm.reset();
    // linkForm.querySelector("input[name='id']").value = "";
    linkForm.id.value = "";
    linkModal.classList.add('open');
};
// open request modal
newLinkBtn.addEventListener('click', openModal);


// close request modal
linkModal.addEventListener('click', (e) => {
    if (e.target.classList.contains('link-modal')) {
        linkModal.classList.remove('open');
    }
});

// add a new request
linkForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const addRequest = firebase.functions().httpsCallable('addRequest');
    const data = {
        title: linkForm.title.value,
        url: linkForm.url.value
    };
    if (linkForm.id.value !== "") {
        updateLink(linkForm.id.value, data);
    } else {
        addLink(data);
    }

});

// notification
const errorNotification = document.querySelector('.errorNotification');

const showErrorNotification = (message) => {
    errorNotification.textContent = message;
    errorNotification.classList.add('active');
    setTimeout(() => {
        errorNotification.classList.remove('active');
        errorNotification.textContent = '';
    }, 4000);
};
const successNotification = document.querySelector('.errorNotification');

const showSuccessNotification = (message) => {
    successNotification.textContent = message;
    successNotification.classList.add('active');
    setTimeout(() => {
        successNotification.classList.remove('active');
        successNotification.textContent = '';
    }, 4000);
};

const editLinkModal = async (id) => {
    openModal();
    linkForm.id.value = id;
    const data = await getLink(id);
    linkForm.title.value = data.title;
    linkForm.url.value = data.url;

};
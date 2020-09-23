const linkModal = document.querySelector('.link-modal');
const deleteModal = document.querySelector('.delete-modal');
const newLinkBtn = document.querySelector('.link-modal-btn');
const linkForm = document.querySelector('.link-modal form');

const openModal = () => {
    linkForm.reset();
    // linkForm.querySelector("input[name='id']").value = "";
    linkForm.id.value = "";
    linkModal.classList.add('open');
};
const openDeleteModal = (id) => {
    deleteModal.classList.add('open');
    const cancel = deleteModal.querySelector("button[name='cancel']");
    const confirm = deleteModal.querySelector("button[name='confirm']");
    cancel.addEventListener('click', () => { deleteModal.classList.remove('open'); });
    confirm.addEventListener('click', () => { deleteConfirm(id); });

};
// open request modal
newLinkBtn.addEventListener('click', openModal);


// close request modal
linkModal.addEventListener('click', (e) => {
    if (e.target.classList.contains('link-modal')) {
        linkModal.classList.remove('open');
    }
});
deleteModal.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-modal')) {
        deleteModal.classList.remove('open');
    }
});

// add a new request
linkForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        title: linkForm.title.value,
        url: linkForm.url.value
    };
    if (linkForm.id.value !== "") {
        await updateLink(linkForm.id.value, data);
    } else {
        await addLink(data);
    }
    rednerLinks();
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
const successNotification = document.querySelector('.successNotification');

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

    if (data) {
        linkForm.title.value = data.title;
        linkForm.url.value = data.url;
    }
};
const deleteConfirm = async (id) => {

    linkForm.id.value = id;
    const result = await deleteLink(id);
    rednerLinks();
};

const rednerLinks = async () => {
    try {
        const uid = await getUserId();

        const links = await getLinks();

        const ul = document.querySelector('.link-list');
        ul.innerHTML = '';
        links.forEach(link => {
            console.log(link);

            const li = document.createElement('li');

            const spanTitle = document.createElement('span');
            spanTitle.classList.add("link-title");
            spanTitle.textContent = link.title;
            li.appendChild(spanTitle);

            const spanUrl = document.createElement('span');
            spanUrl.classList.add("link-url");
            const a = document.createElement('a');
            a.href = `//${link.url}`;
            a.textContent = link.url;
            a.target = '_blank';
            spanUrl.appendChild(a);
            li.appendChild(spanUrl);

            const div = document.createElement('div');

            div.innerHTML = `<i class="material-icons edit" onClick="editLinkModal('${link.id}')">edit</i>
                            <i class="material-icons remove" onClick="openDeleteModal('${link.id}')">remove_circle</i>`;

            li.appendChild(div);

            ul.appendChild(li);

        });

    } catch (error) {
        showErrorNotification(error);
        console.error(error);
    }
};
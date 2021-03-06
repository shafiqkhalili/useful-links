const linkModal = document.querySelector('.link-modal');
const deleteModal = document.querySelector('.delete-modal');
const newLinkBtn = document.querySelector('.link-modal-btn');
const linkForm = document.querySelector('.link-modal form');
const searchInput = document.querySelector('.search');
const linkUl = document.querySelector('.link-list');
let requestPending = false;
let linkTitle = '';


const openModal = () => {
    linkForm.reset();
    // linkForm.querySelector("input[name='id']").value = "";
    linkForm.id.value = "";
    linkModal.classList.add('open');
    linkForm.title.focus();
};
const openDeleteModal = (id) => {
    deleteModal.classList.add('open');
    const cancel = deleteModal.querySelector("button[name='cancel']");
    const confirm = deleteModal.querySelector("button[name='confirm']");
    cancel.addEventListener('click', () => { deleteModal.classList.remove('open'); });
    confirm.addEventListener('click', () => { deleteConfirm(id); });

};

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
    if (!requestPending) {
        requestPending = true;
        linkForm.id.value = id;
        const result = await deleteLink(id);
        await renderLinks({ search: searchInput.value, lastTitle: linkTitle });
        requestPending = false;
    }
};

const renderLinks = async ({
    search = '',
    limit = 20,
    lastTitle = ''
} = {}) => {
    try {
        const uid = await getUserId();

        let links = await getLinks({ search: search, limit: limit, lastTitle: lastTitle });
        if (lastTitle === "") {
            linkUl.innerHTML = '';
        }
        if (search !== "") {
            links = links.filter(link => {
                return link.title.toLocaleLowerCase().includes(search.toLocaleLowerCase());
            });
        }

        links.forEach(link => {

            const li = document.createElement('li');

            const spanTitle = document.createElement('span');
            spanTitle.classList.add("link-title");
            spanTitle.textContent = link.title;
            li.appendChild(spanTitle);

            const spanUrl = document.createElement('span');
            spanUrl.classList.add("link-url");
            const a = document.createElement('a');

            a.href = `${link.url}`;
            a.textContent = link.url.substring(0, 20);
            a.target = '_blank';
            spanUrl.appendChild(a);
            li.appendChild(spanUrl);

            const div = document.createElement('div');

            div.innerHTML = `<i class="material-icons edit" onClick="editLinkModal('${link.id}')">edit</i>
                            <i class="material-icons remove" onClick="openDeleteModal('${link.id}')">delete_forever</i>`;

            li.appendChild(div);

            linkUl.appendChild(li);

        });
        if (links.length === 0 && linkTitle === "") {
            linkUl.innerHTML = `<li>No data found</li>`;
        }
    } catch (error) {
        showErrorNotification(error);

    }
};
// open request modal
newLinkBtn.addEventListener('click', openModal);

//Search input
searchInput.addEventListener('keyup', async (e) => {
    const search = e.target.value;

    await renderLinks({ search: search, lastTitle: linkTitle });

});

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
    linkForm.querySelector('.error').textContent = "";
    if (linkForm.title.value === "" || linkForm.url.value === "") {
        linkForm.querySelector('.error').textContent = "Inputs cannot be empty";
        return;
    }
    const data = {
        title: linkForm.title.value,
        url: linkForm.url.value
    };

    if (linkForm.id.value !== "") {
        await updateLink(linkForm.id.value, data);
    } else {
        await addLink(data);
    }


    await renderLinks({ search: searchInput.value, lastTitle: linkTitle });
});
const lazyLoad = async () => {

    const scrollIsAtTheBottom = (document.documentElement.scrollHeight - window.innerHeight) === window.scrollY;
    if (scrollIsAtTheBottom) {

        if (linkUl.lastChild.firstElementChild) {
            linkTitle = linkUl.lastChild.firstElementChild.textContent;
            console.log("linkTitle ", linkTitle);
            await renderLinks({ search: searchInput.value, lastTitle: linkTitle });
            linkTitle = "";
        }

    }
};
window.addEventListener('scroll', lazyLoad);
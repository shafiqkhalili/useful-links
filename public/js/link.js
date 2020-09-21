var app = new Vue({
    el: '#app',
    data: {
        links: [],
    },
    methods: {
        removeLink(id) {
            deleteLink(id);
        },
        editLink(id) {
            editLinkModal(id);
        }
    },
    mounted() {
        try {
            const ref = firebase.firestore().collection('links').orderBy('title', 'desc');
            ref.onSnapshot(snapshot => {
                let links = [];
                snapshot.forEach(doc => {
                    links.push({ ...doc.data(), id: doc.id });
                });
                this.links = links;
            });
        } catch (error) {
            console.error(error);
        }
    }
});

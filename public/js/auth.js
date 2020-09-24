const authSwitchLinks = document.querySelectorAll('.switch');
const authModals = document.querySelectorAll('.auth .modal');
const authWrapper = document.querySelector('.auth');
const registerForm = document.querySelector('.register');
const loginForm = document.querySelector('.login');
const signOut = document.querySelector('.sign-out');
const gitHubLogin = document.getElementById('github');
const resetPassword = document.getElementById('resetPassword');

// toggle auth modals
authSwitchLinks.forEach(link => {
    link.addEventListener('click', () => {
        authModals.forEach(modal => modal.classList.toggle('active'));
    });
});

// register form
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = registerForm.email.value;
    const password = registerForm.password.value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(user => {
            registerForm.reset();
        })
        .catch(error => {
            registerForm.querySelector('.error').textContent = error.message;
        });
});

// login using Github
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = loginForm.email.value;
    const password = loginForm.password.value;
    loginForm.querySelector('.error').textContent = "";
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(user => {
            loginForm.reset();
        })
        .catch(error => {
            loginForm.querySelector('.error').textContent = error.message;
        });
});
resetPassword.addEventListener('click', (e) => {
    e.preventDefault();
    let auth = firebase.auth();
    const email = loginForm.email.value;
    loginForm.querySelector('.error').textContent = "";

    if (email === "") {
        loginForm.querySelector('.error').textContent = "Email cannot be empty!";
        return;
    }
    auth.sendPasswordResetEmail(email).then(() => {
        showSuccessNotification("Email sent");
        loginForm.querySelector('.error').textContent = "Check your email!";
    }).catch((error) => {
        loginForm.querySelector('.error').textContent = error.message;
    });
});
// login using Github
gitHubLogin.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.querySelector('.error').textContent = "";

    firebase.auth().signInWithPopup(provider)
        .then(user => {
            loginForm.reset();
        })
        .catch(error => {
            loginForm.querySelector('.error').textContent = error.message;
        });
});

// sign out
signOut.addEventListener('click', () => {
    firebase.auth().signOut()
        .then(() => {
            const ul = document.querySelector('.link-list');
            ul.innerHTML = '';
        });

});

// auth listener
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        renderLinks();
        document.querySelector('header').style.display = "flex";
        authWrapper.classList.remove('open');
        authModals.forEach(modal => modal.classList.remove('active'));
    } else {
        document.querySelector('header').style.display = "none";
        authWrapper.classList.add('open');
        authModals[0].classList.add('active');
    }
});
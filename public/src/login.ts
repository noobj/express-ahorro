import './app.css';
const baseUrl = process.env.VUE_APP_BACKEND_API_BASE_URL;

document.querySelector('.login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const url = '/auth/login';
    const account: any = document.querySelector('form.login-form [name=account]');
    const password: any = document.querySelector('form.login-form [name=password]');

    fetch(`${baseUrl}${url}`, {
        method: 'POST',
        credentials: 'include',
        body: new URLSearchParams({
            account: account.value,
            password: password.value
        })
    })
        .then(async (res) => {
            console.log(res);
            const body = await res.json();
            if (res.status !== 200) throw new Error(body.message);
            window.location.href = '/';
        })
        .catch((err) => {
            alert(err.message);
        });
});

document.querySelector('#loginGoogle').addEventListener('click', (e) => {
    e.preventDefault();
    const url = '/auth/login/google';
    fetch(`${baseUrl}${url}`, {
        method: 'POST',
        credentials: 'include'
    })
        .then(async (res) => {
            const body = await res.json();
            const redirUrl = body.message;
            if (res.status !== 200) throw new Error(body.message);
            window.location.href = redirUrl;
        })
        .catch((err) => {
            alert(err.message);
        });
});

document.querySelector('#loginFacebook').addEventListener('click', (e) => {
    e.preventDefault();
    const url = '/auth/login/facebook';
    fetch(`${baseUrl}${url}`, {
        method: 'POST',
        credentials: 'include'
    })
        .then(async (res) => {
            const body = await res.json();
            const redirUrl = body.message;
            if (res.status !== 200) throw new Error(body.message);
            window.location.href = redirUrl;
        })
        .catch((err) => {
            alert(err.message);
        });
});

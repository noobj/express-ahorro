import './app.css';

document.querySelector('.login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const url = '/auth/login';
    const account: any = document.querySelector('form.login-form [name=account]');
    const password: any = document.querySelector('form.login-form [name=password]');
    fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: new URLSearchParams({
            account: account.value,
            password: password.value
        })
    })
        .then(async (res) => {
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
    const url = '/auth/google/login';
    fetch(url, {
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

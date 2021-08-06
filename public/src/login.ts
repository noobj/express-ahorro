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

// // Check if access token or refresh token is still valid
// fetch(`/summaries`, {
//     method: 'GET',
//     credentials: 'include',
//     headers: {
//         'Content-Type': 'application/json',
//         Accept: 'application/json'
//     }
// }).then(async function (response) {
//     if (response.status != 401) window.location.href = '/';

//     return await fetch('/refresh', {
//         credentials: 'include'
//     }).then((res) => {
//         if (res.status == 200) {
//             window.location.href = '/';
//         }
//     });
// });

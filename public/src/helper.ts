export const fetchOrRefreshAuth = async (url: string, opts = {}) => {
    return await fetch(url, opts).then(async (res) => {
        if (res.status !== 401) return res;

        return await fetch('/refresh', {
            credentials: 'include'
        }).then(async (result) => {
            if (result.status === 200) {
                return await fetch(url, opts);
            }

            window.location.href = '/login.html';
        });
    });
};
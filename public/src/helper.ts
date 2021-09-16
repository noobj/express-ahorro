export const fetchOrRefreshAuth = async (url: string, opts = {}) => {
    const baseUrl = process.env.VUE_APP_BACKEND_API_BASE_URL;
    opts['credentials'] = 'include';

    return await fetch(`${baseUrl}${url}`, opts).then(async (res) => {
        if (res.status !== 401) return res;

        return await fetch(`${baseUrl}/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
        }).then(async (result) => {
            if (result.status === 200) {
                return await fetch(`${baseUrl}${url}`, opts);
            }

            window.location.href = '/login.html';
        });
    });
};

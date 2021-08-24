interface User {
    _id: number;
    account: string;
    password?: string;
    google_access_token?: string;
    google_refresh_token?: string;
    google_id?: string;
    refresh_token?: string;
}

export default User;

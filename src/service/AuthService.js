import axios from 'axios';

const auth = axios.create({
    baseURL: 'http://localhost:8080/api/v1/auth',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default auth;

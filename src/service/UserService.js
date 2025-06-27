import axios from 'axios';

const user = axios.create({
    baseURL: 'http://localhost:8080/api/v1/user',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default user;

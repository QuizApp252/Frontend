import axios from 'axios';

const question = axios.create({
    baseURL: 'http://localhost:8080/api/v1/admin/question',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default question;

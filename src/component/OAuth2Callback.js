// OAuth2Callback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuth2Callback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            // ✅ Lưu token vào localStorage
            localStorage.setItem("token", token);
            navigate("/home");
        } else {
            navigate("/login");
        }
    }, []);

    return <p>Đang xử lý đăng nhập bằng Google...</p>;
};

export default OAuth2Callback;

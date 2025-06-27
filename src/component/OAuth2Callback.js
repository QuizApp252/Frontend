import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const OAuth2Callback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const error = params.get("error");

        if (token) {
            // thành công: lưu token rồi vào Home
            sessionStorage.setItem("token", token);
            navigate("/home");
        } else if (error) {
            // thất bại: báo lỗi rồi về login
            toast.error("Đăng nhập bằng Google thất bại, vui lòng thử lại.");
            navigate("/login");
        } else {
            // trường hợp lạ
            navigate("/login");
        }
    }, [navigate]);

    return <p>Đang xử lý đăng nhập bằng Google…</p>;
};

export default OAuth2Callback;

import React, { useState } from 'react';
import api from '../service/AuthService';
import '../css/ChangePassword.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ChangePasswordComponent = ({ onClose }) => {
    const [form, setForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (form.newPassword !== form.confirmPassword) {
            setErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp' });
            return;
        }

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await api.post(
                '/user/change-password',
                {
                    oldPassword: form.oldPassword,
                    newPassword: form.newPassword
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            toast.success(response.data.message || 'Đổi mật khẩu thành công!');
            if (onClose) onClose();
        } catch (error) {
            const resData = error.response?.data;

            if (resData?.data && Array.isArray(resData.data)) {
                const serverErrors = {};
                resData.data.forEach(err => {
                    serverErrors[err.field] = err.message;
                });
                setErrors(serverErrors);
            }
        }
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            navigate('/home');
        }
    };

    return (
        <div className="change-password-overlay">
            <div className="change-password-container">
                <div className="change-password-header">
                    <h2>Đổi mật khẩu</h2>
                    <button
                        className="close-button"
                        onClick={handleClose}
                        aria-label="Đóng"
                    >
                        &times;
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="change-password-form">
                    <div className="form-group">
                        <label>Mật khẩu cũ</label>
                        <input
                            type="password"
                            name="oldPassword"
                            value={form.oldPassword}
                            onChange={handleChange}
                        />
                        {errors.oldPassword && <small className="error">{errors.oldPassword}</small>}
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu mới</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={form.newPassword}
                            onChange={handleChange}
                        />
                        {errors.newPassword && <small className="error">{errors.newPassword}</small>}
                    </div>

                    <div className="form-group">
                        <label>Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                        />
                        {errors.confirmPassword && <small className="error">{errors.confirmPassword}</small>}
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-submit">Xác nhận</button>
                        <button type="button" className="btn-cancel" onClick={handleClose}>Đóng</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordComponent;
import React, { useState } from 'react';
import auth from '../service/AuthService';
import user from '../service/UserService';
import '../css/ChangePassword.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

const ChangePasswordComponent = ({ onClose }) => {
    const [form, setForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [show, setShow] = useState({
        old: false,
        new: false,
        confirm: false
    });

    const navigate = useNavigate();

    const toggleShow = (field) => {
        setShow(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const passwordSchema = Yup.object().shape({
        oldPassword: Yup.string().required('Mật khẩu cũ không được để trống'),
        newPassword: Yup.string()
            .min(8, 'Mật khẩu ít nhất 8 ký tự')
            .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':",.<>/?\\|~])/,
                'Mật khẩu cần chứa chữ hoa, thường, số và ký tự đặc biệt')
            .required('Mật khẩu không được để trống')
            .notOneOf([Yup.ref('oldPassword')], 'Mật khẩu mới không được trùng với mật khẩu cũ'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp')
            .required('Vui lòng xác nhận mật khẩu')
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        try {
            await passwordSchema.validate(form, { abortEarly: false });

            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await user.post(
                '/change-password',
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
            setForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); // ✅ Reset form
            if (onClose) onClose();

        } catch (err) {
            if (err.name === 'ValidationError') {
                const validationErrors = {};
                err.inner.forEach(error => {
                    validationErrors[error.path] = error.message;
                });
                setErrors(validationErrors);
            } else {
                const resData = err.response?.data;
                if (resData?.data && Array.isArray(resData.data)) {
                    const serverErrors = {};
                    resData.data.forEach(err => {
                        serverErrors[err.field] = err.message;
                    });
                    setErrors(serverErrors);
                } else {
                    toast.error('Mật khẩu không đúng!');
                }
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
                    <button className="close-button" onClick={handleClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="change-password-form">
                    {['oldPassword', 'newPassword', 'confirmPassword'].map((field, i) => {
                        const labels = {
                            oldPassword: 'Mật khẩu cũ',
                            newPassword: 'Mật khẩu mới',
                            confirmPassword: 'Xác nhận mật khẩu mới'
                        };
                        const toggleField = field === 'oldPassword' ? 'old' : field === 'newPassword' ? 'new' : 'confirm';
                        return (
                            <div className="form-group" key={field}>
                                <label>{labels[field]}</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={show[toggleField] ? "text" : "password"}
                                        name={field}
                                        value={form[field]}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password-btn"
                                        onClick={() => toggleShow(toggleField)}
                                    >
                                        {show[toggleField] ? "🙈" : "👁"}
                                    </button>
                                </div>
                                {errors[field] && <small className="error">{errors[field]}</small>}
                            </div>
                        );
                    })}

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

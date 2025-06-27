
// ForgotPasswordComponent.jsx
import React, { useState } from 'react';
import auth from '../service/AuthService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../css/ForgotPassword.css';

const ForgotPasswordComponent = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);

        if (value && !validateEmail(value)) {
            setEmailError('Email không hợp lệ');
        } else if (!value) {
            setEmailError('Email không được để trống');
        } else {
            setEmailError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setEmailError('Email không được để trống');
            return;
        }

        if (!validateEmail(email)) {
            setEmailError('Email không hợp lệ');
            return;
        }

        setLoading(true);
        try {
            await auth.post('/forgot-password', { email });
            toast.success("OTP đã được gửi đến email của bạn!");
            localStorage.setItem('resetEmail', email);
            navigate('/reset-password');
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Lỗi gửi OTP. Vui lòng thử lại!";
            toast.error(errorMessage);
            if (err.response?.status === 404) {
                setEmailError('Email không tồn tại trong hệ thống');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <form onSubmit={handleSubmit} className="forgot-password-form">
                <h2>Quên mật khẩu</h2>

                <p style={{
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '14px',
                    marginBottom: '20px',
                    lineHeight: '1.5'
                }}>
                    Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
                </p>

                <label>Email <span style={{color: "red"}}>*</span></label>
                <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={handleEmailChange}
                    className={emailError ? 'forgot-password-error-input' : ''}
                    required
                    autoComplete="email"
                />
                <div className="forgot-password-error">{emailError || '\u00A0'}</div>

                <button
                    type="submit"
                    className="forgot-password-btn"
                    disabled={loading || !email || emailError}
                >
                    {loading && <span className="loading-spinner"></span>}
                    {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                </button>

                <div className="back-to-login">
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                        ← Quay lại đăng nhập
                    </a>
                </div>
            </form>
        </div>
    );
};

export default ForgotPasswordComponent;
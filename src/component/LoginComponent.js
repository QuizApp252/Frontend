import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../service/AuthService';
import '../css/Login.css';
import Header from "./HeaderComponent";

const LoginComponent = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const togglePassword = () => setShowPassword(prev => !prev);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Email không hợp lệ')
                .required('Email không được để trống'),
            password: Yup.string()
                .required('Mật khẩu không được để trống')
        }),
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                const res = await api.post('/auth/login', values);
                const { token } = res.data.data;
                // Xóa token/user cũ
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('token', token);
                toast.success('Đăng nhập thành công!');
                navigate('/home');
            } catch (err) {
                if (err.response?.data?.data) {
                    const serverErrors = {};
                    err.response.data.data.forEach(({ field, message }) => {
                        serverErrors[field] = message;
                    });
                    setErrors(serverErrors);
                } else {
                    toast.error('Tài khoản hoặc mật khẩu chưa đúng!');
                }
            } finally {
                setSubmitting(false);
            }
        }
    });

    const handleGoogleLogin = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
    };

    return (
        <>
            <Header/>
            <div className="login-container">
                <form onSubmit={formik.handleSubmit} className="login-form">
                    <h2>Đăng nhập</h2>

                    <label>Email<span style={{ color: "red" }}>*</span></label>
                    <input
                        type="text"
                        name="email"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                        className={formik.touched.email && formik.errors.email ? 'login-error-input' : ''}
                    />
                    <div className="login-error">{(formik.touched.email && formik.errors.email) || '\u00A0'}</div>

                    <label>Mật khẩu<span style={{ color: "red" }}>*</span></label>
                    <div className="login-password-field">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                            className={formik.touched.password && formik.errors.password ? 'login-error-input' : ''}
                        />
                        <button type="button" onClick={togglePassword} className="login-toggle-btn">
                            {showPassword ? "🙈" : "👁"}
                        </button>
                    </div>
                    <div className="login-error">{(formik.touched.password && formik.errors.password) || '\u00A0'}</div>

                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                            style={{ width: "16px", height: "16px" }}
                        />
                        <label htmlFor="rememberMe" style={{ fontSize: "14px", cursor: "pointer" }}>
                            Duy trì đăng nhập
                        </label>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <button
                            type="submit"
                            id="login-btn"
                            className="login-sm-btn"
                            disabled={formik.isSubmitting}
                            style={{ width: '35%' }}
                        >
                            {formik.isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>

                        <button
                            type="button"
                            className="login-sm-btn"
                            style={{ background: "#db4437", width: '60%' }}
                            onClick={handleGoogleLogin}
                        >
                            Đăng nhập bằng Google
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default LoginComponent;

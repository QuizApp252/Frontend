import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import '../css/Register.css';
import api from '../service/AuthService';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const RegisterComponent = () => {
    const navigate = useNavigate();

    // 👉 State để quản lý hiển thị mật khẩu
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const togglePassword = () => setShowPassword(prev => !prev);
    const toggleConfirmPassword = () => setShowConfirmPassword(prev => !prev);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            passwordConfirm: '',
            name: ''
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Email không hợp lệ')
                .required('Email không được để trống'),
            password: Yup.string()
                .min(8, 'Mật khẩu ít nhất 8 ký tự')
                .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':",.<>/?\\|~])/,
                    'Mật khẩu cần chứa chữ hoa, thường, số và ký tự đặc biệt')
                .required('Mật khẩu không được để trống'),
            passwordConfirm: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Mật khẩu không khớp')
                .required('Xác nhận mật khẩu không được để trống'),
            name: Yup.string()
                .min(3, 'Họ tên ít nhất 3 ký tự')
                .required('Họ tên không được để trống'),
        }),
        onSubmit: async (values, { setSubmitting, setErrors, resetForm }) => {
            try {
                const res = await api.post('/auth/register', values);
                localStorage.setItem("pendingEmail", values.email);
                navigate("/verify-otp", {
                    state: {
                        showSuccessToast: true
                    }
                });
                resetForm();
            } catch (err) {
                if (err.response?.data?.data) {
                    const serverErrors = {};
                    err.response.data.data.forEach(({ field, message }) => {
                        serverErrors[field] = message;
                    });
                    setErrors(serverErrors);
                } else {
                    toast.error("Đã có lỗi xảy ra khi đăng ký!");
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <>
            <div className="register-container">
                <form onSubmit={formik.handleSubmit} className="register-form">
                    <h2>Đăng ký</h2>

                    <label>Email<span style={{ color: "red" }}>*</span></label>
                    <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                    />
                    <div className="register-error">{(formik.touched.email && formik.errors.email) || '\u00A0'}</div>

                    <label>Mật khẩu<span style={{ color: "red" }}>*</span></label>
                    <div className="register-password-field">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            autoComplete="new-password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                        />
                        <button type="button" onClick={togglePassword} className="register-toggle-btn">
                            {showPassword ? "🙈" : "👁"}
                        </button>
                    </div>
                    <div className="register-error">{(formik.touched.password && formik.errors.password) || '\u00A0'}</div>

                    <label>Xác nhận mật khẩu<span style={{ color: "red" }}>*</span></label>
                    <div className="register-password-field">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="passwordConfirm"
                            autoComplete="new-password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.passwordConfirm}
                        />
                        <button type="button" onClick={toggleConfirmPassword} className="register-toggle-btn">
                            {showConfirmPassword ? "🙈" : "👁"}
                        </button>
                    </div>
                    <div className="register-error">{(formik.touched.passwordConfirm && formik.errors.passwordConfirm) || '\u00A0'}</div>

                    <label>Họ tên<span style={{ color: "red" }}>*</span></label>
                    <input
                        type="text"
                        name="name"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.name}
                    />
                    <div className="register-error">{(formik.touched.name && formik.errors.name) || '\u00A0'}</div>

                    <button
                        type="submit"
                        className="register-sm-btn"
                        disabled={formik.isSubmitting}
                        style={{ textAlign: "center" }}
                    >
                        {formik.isSubmitting ? "Đang xử lý..." : "Đăng ký"}
                    </button>
                </form>
            </div>
        </>
    );
};

export default RegisterComponent;
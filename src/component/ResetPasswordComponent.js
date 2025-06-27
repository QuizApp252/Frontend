import React, { useState, useEffect, useRef } from 'react';
import auth from '../service/AuthService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../css/ResetPassword.css';

const ResetPasswordComponent = () => {
    const [otp, setOtp] = useState(Array(6).fill('')); // OTP as array of 6 digits
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const email = localStorage.getItem('resetEmail');
    const inputRefs = useRef([]); // Refs for OTP input focus

    useEffect(() => {
        if (!email) {
            toast.error('Phiên làm việc đã hết hạn. Vui lòng thử lại!');
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    // Password validation regex from Yup schema
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':",.<>/?\\|~])/;

    // Handle OTP input change
    const handleOtpChange = (e, index) => {
        const val = e.target.value.replace(/\D/, ''); // Allow only digits
        if (!val) return;
        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);
        setErrors(prev => ({ ...prev, otp: '' }));
        if (index < 5 && val) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Handle backspace for OTP inputs
    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            const newOtp = [...otp];
            if (otp[index]) {
                newOtp[index] = '';
            } else if (index > 0) {
                inputRefs.current[index - 1].focus();
                newOtp[index - 1] = '';
            }
            setOtp(newOtp);
        }
    };

    // Handle pasting OTP
    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').trim().slice(0, 6);
        if (/^\d{6}$/.test(data)) {
            const newOtp = data.split('');
            setOtp(newOtp);
            inputRefs.current[5].focus();
        }
    };

    // Handle password input change with validation
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);

        if (value.length < 8) {
            setErrors(prev => ({ ...prev, password: 'Mật khẩu ít nhất 8 ký tự' }));
        } else if (!passwordRegex.test(value)) {
            setErrors(prev => ({ ...prev, password: 'Mật khẩu cần chứa chữ hoa, thường, số và ký tự đặc biệt' }));
        } else {
            setErrors(prev => ({ ...prev, password: '' }));
        }

        if (confirmPassword && value !== confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: 'Mật khẩu xác nhận không khớp' }));
        } else if (confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
    };

    // Handle confirm password change
    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);

        if (value && value !== newPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: 'Mật khẩu xác nhận không khớp' }));
        } else {
            setErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        const joinedOtp = otp.join('');
        if (joinedOtp.length < 6) {
            newErrors.otp = 'Vui lòng nhập đủ 6 số OTP';
        }

        if (!newPassword) {
            newErrors.password = 'Mật khẩu mới không được để trống';
        } else if (newPassword.length < 8) {
            newErrors.password = 'Mật khẩu ít nhất 8 ký tự';
        } else if (!passwordRegex.test(newPassword)) {
            newErrors.password = 'Mật khẩu cần chứa chữ hoa, thường, số và ký tự đặc biệt';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            await auth.post('/reset-password', {
                email,
                otp: joinedOtp,
                newPassword
            });
            toast.success('Mật khẩu đã được đặt lại thành công!');
            localStorage.removeItem('resetEmail');
            navigate('/login');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Lỗi đặt lại mật khẩu!';
            toast.error(errorMessage);
            if (err.response?.status === 400) {
                setErrors({ otp: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP resend
    const handleResendOtp = async () => {
        try {
            await auth.post('/forgot-password', { email });
            toast.success('Mã OTP mới đã được gửi đến email!');
        } catch (err) {
            toast.error('Bạn gửi quá nhiều yêu cầu, vui lòng chờ 60s!');
        }
    };

    return (
        <div className="reset-password-container">
            <form onSubmit={handleSubmit} className="reset-password-form">
                <h2>Đặt lại mật khẩu</h2>
                <p style={{
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '14px',
                    marginBottom: '20px',
                    lineHeight: '1.5'
                }}>
                    Nhập mã OTP đã được gửi đến email: <strong>{email}</strong>
                </p>

                <label>Mã OTP <span style={{ color: 'red' }}>*</span></label>
                <div className="reset-password-otp-inputs" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className={`reset-password-otp-box ${errors.otp ? 'reset-password-error-input' : ''}`}
                            value={digit}
                            ref={(el) => (inputRefs.current[index] = el)}
                            onChange={(e) => handleOtpChange(e, index)}
                            onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        />
                    ))}
                </div>
                <div className="reset-password-error">{errors.otp || '\u00A0'}</div>

                <label>Mật khẩu mới <span style={{ color: 'red' }}>*</span></label>
                <div className="reset-password-field">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={handlePasswordChange}
                        className={errors.password ? 'reset-password-error-input' : ''}
                        required
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        className="reset-password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? '🙈' : '👁'}
                    </button>
                </div>
                <div className="reset-password-error">{errors.password || '\u00A0'}</div>

                <label>Xác nhận mật khẩu <span style={{ color: 'red' }}>*</span></label>
                <div className="reset-password-field">
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        className={errors.confirmPassword ? 'reset-password-error-input' : ''}
                        required
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        className="reset-password-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? '🙈' : '👁'}
                    </button>
                </div>
                <div className="reset-password-error">{errors.confirmPassword || '\u00A0'}</div>

                <button
                    type="submit"
                    className="reset-password-btn"
                    disabled={loading}
                >
                    {loading && <span className="loading-spinner"></span>}
                    {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                </button>

                <div className="resend-otp-container">
                    <span>
                        Không nhận được mã OTP?
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            className="resend-otp-btn"
                        >
                            Gửi lại
                        </button>
                    </span>
                </div>

                <div className="back-to-login">
                    <a href="#" onClick={(e) => {
                        e.preventDefault();
                        localStorage.removeItem('resetEmail');
                        navigate('/login');
                    }}>
                        ← Quay lại đăng nhập
                    </a>
                </div>
            </form>
        </div>
    );
};

export default ResetPasswordComponent;
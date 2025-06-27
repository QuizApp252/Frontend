import React, { useState, useEffect, useRef } from 'react';
import auth from '../service/AuthService';
import '../css/Verify.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const VerifyComponent = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [locked, setLocked] = useState(false);
    const [otp, setOtp] = useState(Array(6).fill(''));
    const inputRefs = useRef([]);
    const location = useLocation();
    const navigate = useNavigate();
    const [isResending, setIsResending] = useState(false);
    const toastId = useRef(null);

    useEffect(() => {
        const storedEmail = localStorage.getItem('pendingEmail');
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            navigate('/register');
        }
    }, [navigate]);

    useEffect(() => {
        if (location.state?.showSuccessToast) {
            toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực OTP.');
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setMessage('');
        const joinedOtp = otp.join('');

        if (joinedOtp.length < 6) {
            toast.dismiss();
            toastId.current = toast.error('Vui lòng nhập đủ 6 số OTP', {
                onClose: () => (toastId.current = null),
            });
            return;
        }

        try {
            const res = await auth.post('/verify-otp', { email, otp: joinedOtp });
            toast.dismiss();
            toast.success('Xác thực thành công!');
            localStorage.removeItem('pendingEmail');
            navigate('/login');
        } catch (err) {
            let msg = 'Xác thực thất bại!';
            if (err.response?.data?.data && Array.isArray(err.response.data.data)) {
                msg = err.response.data.data[0].message || msg;
            } else if (err.response?.data?.message) {
                msg = err.response.data.message;
            }

            setError(msg);
            toast.dismiss();
            toastId.current = toast.error(msg, {
                onClose: () => (toastId.current = null),
            });

            if (msg.includes('3 lần')) {
                setLocked(true);
            }
        }
    };

    const handleResend = async () => {
        setMessage('');
        setError('');
        setIsResending(true);

        try {
            const res = await auth.post('/resend-otp', { email });
            toast.dismiss();
            setMessage(res.data.message || 'OTP mới đã được gửi!');
            setLocked(false);
            setOtp(Array(6).fill(''));
            toast.success("OTP mới đã được gửi!");
        } catch (err) {
            const msg = err.response?.data?.message || 'Không thể gửi lại OTP!';
            toast.dismiss();
            setError(msg);
            toast.error(msg);
        } finally {
            setIsResending(false);
        }
    };

    const handleChange = (e, index) => {
        const val = e.target.value.replace(/\D/, '');
        if (!val) return;
        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);
        setError('');
        setMessage('');
        if (index < 5 && val) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
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

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').trim().slice(0, 6);
        if (/^\d{6}$/.test(data)) {
            const newOtp = data.split('');
            setOtp(newOtp);
            inputRefs.current[5].focus();
        }
    };

    return (
        <div className="verify-container">
            <form onSubmit={handleVerify} className="verify-form">
                <h2 className="verify-title">Xác minh OTP</h2>
                <p className="verify-email">Email: {email}</p>

                <label className="verify-label">Nhập mã OTP</label>
                <div className="verify-otp-inputs" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className={`verify-otp-box ${locked ? 'disabled' : ''}`}
                            value={digit}
                            ref={(el) => (inputRefs.current[index] = el)}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            disabled={locked}
                        />
                    ))}
                </div>

                <div className="verify-button-group">
                    <div className="verify-button-wrapper">
                        <button type="submit" className="verify-button primary" disabled={locked}>
                            Xác minh
                        </button>
                    </div>
                    <div className="verify-button-wrapper">
                        <button
                            type="button"
                            className="verify-button secondary"
                            onClick={handleResend}
                            disabled={isResending}
                        >
                            {isResending ? "Đang gửi..." : "Gửi lại OTP"}
                        </button>
                    </div>
                </div>

                {message && <p className="verify-message success">{message}</p>}
                {error && <p className="verify-message error">{error}</p>}
            </form>
        </div>
    );
};

export default VerifyComponent;
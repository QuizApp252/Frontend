import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../css/Header.css';
import ProfileComponent from "./ProfileComponent";

// Hàm giải mã JWT
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Không thể giải mã token:', e);
        return null;
    }
}

const Header = () => {
    const [user, setUser] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token || token === 'undefined') return;

        const decoded = parseJwt(token);
        if (decoded && decoded.name) {
            setUser({
                name: decoded.name,
                email: decoded.email
            });
        } else {
            console.warn('Token không chứa name hoặc email');
        }
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setUser(null);
        toast.success('Đăng xuất thành công!');
        navigate('/login');
    };

    const handleAuthNavigation = () => {
        if (location.pathname === '/login') {
            navigate('/register');
        } else if (location.pathname === '/register') {
            navigate('/login');
        } else {
            navigate('/home');
        }
    };

    const toggleProfile = () => {
        setShowProfile(prev => !prev);
    };

    const getAuthButtonText = () => {
        if (location.pathname === '/login') {
            return 'Đăng ký';
        } else if (location.pathname === '/register') {
            return 'Đăng nhập';
        }
        return 'Đăng nhập';
    };

    return (
        <header className="header-container">
            <div className="header-logo">
                <h1>Quiz App</h1>
            </div>
            <div className="header-auth">
                {user ? (
                    <div className="header-user-section">
                        <span className="header-greeting">Xin chào, {user.name}</span>
                        <button className="header-logout-btn" onClick={handleLogout}>
                            Đăng xuất
                        </button>
                        <div className="header-profile-toggle">
                            <button className="header-profile-btn" onClick={toggleProfile}>
                                Hồ sơ
                            </button>
                            {showProfile && <ProfileComponent onClose={toggleProfile} />}
                        </div>
                    </div>
                ) : (
                    <button className="header-auth-btn" onClick={handleAuthNavigation}>
                        {getAuthButtonText()}
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;

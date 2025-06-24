import React from 'react';
import '../css/Footer.css';

const FooterComponent = () => {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="footer-section footer-logo">
                    <h2>Quiz App</h2>
                    <p>Khám phá kiến thức, thử thách trí tuệ!</p>
                </div>
                <div className="footer-section footer-links">
                    <h3>Liên kết nhanh</h3>
                    <ul>
                        <li><a href="/home">Trang chủ</a></li>
                        <li><a href="/about">Về chúng tôi</a></li>
                        <li><a href="/contact">Liên hệ</a></li>
                        <li><a href="/privacy">Chính sách bảo mật</a></li>
                    </ul>
                </div>
                <div className="footer-section footer-contact">
                    <h3>Liên hệ</h3>
                    <p>Email: <a href="mailto:support@quizapp.com">support@quizapp.com</a></p>
                    <p>Điện thoại: <a href="tel:+1234567890">+123-456-7890</a></p>
                    <p>Địa chỉ: 123 Đường Kiến Thức, TP. Học Tập</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Quiz App. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default FooterComponent;
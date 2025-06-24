import React from 'react';
import Header from './HeaderComponent';
import '../css/Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <Header />
            <main className="home-content">
                <h2>Chào mừng đến với Quiz App</h2>
                <p>Bắt đầu kiểm tra kiến thức của bạn với các câu hỏi thú vị!</p>
                <button className="home-start-btn">Bắt đầu Quiz</button>
            </main>
        </div>
    );
};

export default Home;

import React from 'react';
import HeaderComponent from './HeaderComponent';
import FooterComponent from './FooterComponent';
import { Outlet } from 'react-router-dom';


const Layout = () => {
    return (
        <div className="app-container">
            <HeaderComponent />
            <main className="main-content">
                <Outlet />
            </main>
            <FooterComponent />
        </div>
    );
};

export default Layout;
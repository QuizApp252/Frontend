// src/App.js
import './App.css';
import RegisterComponent from './component/RegisterComponent';
import VerifyComponent from './component/VerifyComponent';
import LoginComponent from './component/LoginComponent';
import OAuth2Callback from './component/OAuth2Callback';
import HomeComponent from './component/HomeComponent';
import ChangePasswordComponent from "./component/ChangePasswordComponent";
import ProfileComponent from "./component/ProfileComponent";
import ForgotPasswordComponent from "./component/ForgotPasswordComponent";
import ResetPasswordComponent from "./component/ResetPasswordComponent";
import UploadFileComponent from "./component/UploadFileComponent";
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './component/Layout';

function App() {
    return (
        <>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/home" element={<HomeComponent />} />
                    <Route path="/register" element={<RegisterComponent />} />
                    <Route path="/verify-otp" element={<VerifyComponent />} />
                    <Route path="/login" element={<LoginComponent />} />
                    <Route path="/oauth2/callback" element={<OAuth2Callback />} />
                    <Route path="/change-password" element={<ChangePasswordComponent />} />
                    <Route path="/profile" element={<ProfileComponent />} />
                    <Route path="/forgot-password" element={<ForgotPasswordComponent />} />
                    <Route path="/reset-password" element={<ResetPasswordComponent />} />
                    <Route path="/upload" element={<UploadFileComponent />} />
                                       {/* Route mặc định */}
                    <Route path="/" element={<HomeComponent />} />
                </Route>
            </Routes>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                style={{ top: '70px' }}
            />
        </>
    );
}

export default App;
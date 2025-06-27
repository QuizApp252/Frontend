import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import user from '../service/UserService';
import '../css/Profile.css';
import { useNavigate } from 'react-router-dom';

const ProfileComponent = () => {
    const [profile, setProfile] = useState(null);
    const [editedFields, setEditedFields] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const res = await user.get('/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(res.data.data);
                formik.setValues({
                    name: res.data.data.name || '',
                    phoneNumber: res.data.data.phoneNumber || '',
                    dateOfBirth: res.data.data.dateOfBirth || '',
                    avatar: res.data.data.avatar || null
                });
            } catch (err) {
                toast.error('Không thể tải thông tin người dùng');
            }
        };
        fetchProfile();
    }, []);

    const formik = useFormik({
        initialValues: {
            name: '',
            phoneNumber: '',
            dateOfBirth: '',
            avatar: null
        },
        validationSchema: Yup.object({
            name: Yup.string()
                .required('Tên không được để trống')
                .min(2, 'Tên phải từ 2 đến 50 ký tự')
                .max(50, 'Tên phải từ 2 đến 50 ký tự'),
            phoneNumber: Yup.string()
                .matches(/^(\+84|0)([0-9]{9})$/, 'Số điện thoại không hợp lệ')
                .nullable(),
            dateOfBirth: Yup.date()
                .nullable()
                .max(new Date(), 'Ngày sinh phải là ngày trong quá khứ')
                .typeError('Ngày sinh không hợp lệ'),
            avatar: Yup.mixed().nullable()
        }),
        onSubmit: async (values, { setSubmitting }) => {
            // This won't be called directly, each field is updated individually
        }
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                setFieldErrors(prev => ({ ...prev, avatar: 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF)' }));
                return;
            }

            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                setFieldErrors(prev => ({ ...prev, avatar: 'Kích thước file không được vượt quá 10MB' }));
                return;
            }

            formik.setFieldValue('avatar', file);
            setEditedFields(prev => ({ ...prev, avatar: true }));
            setFieldErrors(prev => ({ ...prev, avatar: null }));
        }
    };

    const handleFieldChange = (field, value) => {
        formik.setFieldValue(field, value);
        setEditedFields(prev => ({ ...prev, [field]: true }));
        setFieldErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleUpdateField = async (field) => {
        if (!editedFields[field]) return;

        try {
            await formik.validateField(field);

            if (formik.errors[field]) {
                formik.setFieldTouched(field, true);
                return;
            }

            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const formData = new FormData();

            if (field === 'avatar' && formik.values.avatar && typeof formik.values.avatar !== 'string') {
                formData.append('avatar', formik.values.avatar);
            } else if (field !== 'avatar') {
                formData.append(field, formik.values[field] ?? '');
            }

            if (field !== 'name' && formik.values.name) {
                formData.append('name', formik.values.name);
            }

            const response = await user.post('/profile/update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            toast.success(`Cập nhật ${getFieldDisplayName(field)} thành công!`);
            setEditedFields(prev => ({ ...prev, [field]: false }));
            setFieldErrors(prev => ({ ...prev, [field]: null }));

            const profileRes = await user.get('/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(profileRes.data.data);

            if (field === 'avatar' && response.data.data?.avatar) {
                formik.setFieldValue('avatar', response.data.data.avatar);
            }

        } catch (err) {
            const errorResponse = err.response?.data;

            if (errorResponse?.data && Array.isArray(errorResponse.data)) {
                const newFieldErrors = {};
                errorResponse.data.forEach(error => {
                    newFieldErrors[error.field] = error.message;
                });
                setFieldErrors(prev => ({ ...prev, ...newFieldErrors }));
                if (errorResponse.data.length > 0) {
                    toast.error(errorResponse.data[0].message);
                }
            } else {
                const errorMessage = errorResponse?.message || `Lỗi cập nhật ${getFieldDisplayName(field)}`;
                toast.error(errorMessage);
                setFieldErrors(prev => ({ ...prev, [field]: errorMessage }));
            }
        }
    };

    const getFieldDisplayName = (field) => {
        const displayNames = {
            name: 'tên',
            phoneNumber: 'số điện thoại',
            dateOfBirth: 'ngày sinh',
            avatar: 'ảnh đại diện'
        };
        return displayNames[field] || field;
    };

    const getFieldError = (field) => {
        return fieldErrors[field] || (formik.touched[field] && formik.errors[field]);
    };

    const handleClose = () => {
        navigate('/home');
    };

    if (!profile) {
        return (
            <div className="profile-overlay">
                <div className="profile-modal loading">
                    <div>Đang tải thông tin...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-overlay">
            <div className="profile-modal">
                <div className="profile-header">
                    <h2>Thông tin cá nhân</h2>
                    <button className="close-button" onClick={handleClose}>×</button>
                </div>

                <div className="profile-avatar-section">
                    <div className="file-input-wrapper">
                        {formik.values.avatar && typeof formik.values.avatar === 'string' && (
                            <img src={formik.values.avatar} alt="avatar" className="profile-avatar" />
                        )}
                        {formik.values.avatar && typeof formik.values.avatar !== 'string' && (
                            <img src={URL.createObjectURL(formik.values.avatar)} alt="preview" className="profile-avatar" />
                        )}
                        {!formik.values.avatar && (
                            <div className="profile-avatar placeholder">
                                {formik.values.name ? formik.values.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}

                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="avatar-upload" className="file-input-label">📷</label>
                    </div>

                    {getFieldError('avatar') && (
                        <div className="error avatar-error">{getFieldError('avatar')}</div>
                    )}

                    {editedFields.avatar && !getFieldError('avatar') && (
                        <button
                            onClick={() => handleUpdateField('avatar')}
                            className="update-btn avatar-update"
                        >
                            Cập nhật ảnh đại diện
                        </button>
                    )}
                </div>

                <div className="profile-content">
                    <div className={`profile-field ${editedFields.name ? 'edited' : ''} ${getFieldError('name') ? 'error' : ''}`}>
                        <label>Họ và tên <span style={{color:"red"}}>*</span></label>
                        <div className="profile-field-input">
                            <input
                                type="text"
                                value={formik.values.name || ''}
                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                onBlur={() => formik.setFieldTouched('name', true)}
                                placeholder="Nhập họ và tên"
                                className={getFieldError('name') ? 'error' : ''}
                            />
                            <button
                                onClick={() => handleUpdateField('name')}
                                disabled={!editedFields.name || !!getFieldError('name')}
                                className="update-btn"
                            >
                                Cập nhật
                            </button>
                        </div>
                        {getFieldError('name') && (
                            <div className="error">{getFieldError('name')}</div>
                        )}
                    </div>

                    <div className={`profile-field ${editedFields.phoneNumber ? 'edited' : ''} ${getFieldError('phoneNumber') ? 'error' : ''}`}>
                        <label>Số điện thoại</label>
                        <div className="profile-field-input">
                            <input
                                type="tel"
                                value={formik.values.phoneNumber || ''}
                                onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                                onBlur={() => formik.setFieldTouched('phoneNumber', true)}
                                placeholder="Nhập số điện thoại (VD: 0901234567)"
                                className={getFieldError('phoneNumber') ? 'error' : ''}
                            />
                            <button
                                onClick={() => handleUpdateField('phoneNumber')}
                                disabled={!editedFields.phoneNumber || !!getFieldError('phoneNumber')}
                                className="update-btn"
                            >
                                Cập nhật
                            </button>
                        </div>
                        {getFieldError('phoneNumber') && (
                            <div className="error">{getFieldError('phoneNumber')}</div>
                        )}
                    </div>

                    <div className={`profile-field ${editedFields.dateOfBirth ? 'edited' : ''} ${getFieldError('dateOfBirth') ? 'error' : ''}`}>
                        <label>Ngày sinh</label>
                        <div className="profile-field-input">
                            <input
                                type="date"
                                value={formik.values.dateOfBirth || ''}
                                onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                                onBlur={() => formik.setFieldTouched('dateOfBirth', true)}
                                className={getFieldError('dateOfBirth') ? 'error' : ''}
                                max={new Date().toISOString().split('T')[0]}
                            />
                            <button
                                onClick={() => handleUpdateField('dateOfBirth')}
                                disabled={!editedFields.dateOfBirth || !!getFieldError('dateOfBirth')}
                                className="update-btn"
                            >
                                Cập nhật
                            </button>
                        </div>
                        {getFieldError('dateOfBirth') && (
                            <div className="error">{getFieldError('dateOfBirth')}</div>
                        )}
                    </div>
                </div>
                <div className="profile-actions">
                    <button
                        onClick={() => navigate('/change-password')}
                        className="change-password-link"
                    >
                        🔒 Đổi mật khẩu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileComponent;
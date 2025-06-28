import React, { useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/UploadFile.css';
import question from "../service/QuestionService";

const UploadFileComponent = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const toastId = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

        if (!validTypes.includes(selectedFile.type) && !['xlsx', 'xls'].includes(fileExtension)) {
            toast.error(' Chỉ chấp nhận file Excel (.xlsx, .xls)');
            e.target.value = '';
            return;
        }

        setFile(selectedFile);
        setResult(null);
    };

    const handleUpload = async () => {
        if (!file) {
            toast.warning('Vui lòng chọn file Excel.');
            return;
        }

        setUploading(true);
        setResult(null);

        toastId.current = toast.loading('⏳ Đang upload file...');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await question.post('/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setResult(res.data);
            toast.update(toastId.current, {
                render: 'Upload thành công!',
                type: 'success',
                isLoading: false,
                autoClose: 3000
            });
        } catch (err) {
            toast.update(toastId.current, {
                render: `Upload thất bại: ${err.response?.data || err.message}`,
                type: 'error',
                isLoading: false,
                autoClose: 5000
            });
        } finally {
            setUploading(false);
            // Không reset file ở đây nếu bạn muốn hiển thị tên file
            // setFile(null);
        }
    };

    const handleReset = () => {
        setFile(null);
        setResult(null);
    };

    const handleDownloadTemplate = () => {
        const link = document.createElement('a');
        link.href = '/templates/sample_questions_full.xlsx';
        link.download = 'sample_questions_full.xlsx';
        link.click();
    };

    return (
        <div className="upload-container">
            <ToastContainer />

            <div className="upload-form">
                <h2>📥 Import Câu Hỏi từ Excel</h2>

                <div className="upload-file-section">
                    <div className="upload-file-input">
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className={`upload-file-label ${file ? 'has-file' : ''}`}>
                            <span>📄</span>
                            <span>
                                {file ? `Đã chọn: ${file.name}` : 'Chọn file Excel (.xlsx, .xls)'}
                            </span>
                        </label>
                    </div>
                </div>

                <div className="upload-button-group">
                    <button
                        className="upload-btn upload-btn-primary"
                        onClick={handleUpload}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <div className="upload-loading">
                                <div className="upload-spinner"></div>
                                <span>Đang upload...</span>
                            </div>
                        ) : (
                            <>
                                <span>📤</span>
                                <span>Upload</span>
                            </>
                        )}
                    </button>

                    <button
                        className="upload-btn upload-btn-secondary"
                        onClick={handleReset}
                        disabled={!result && !file}
                    >
                        <span>🔄</span>
                        <span>Reset</span>
                    </button>

                    <button
                        className="upload-btn upload-btn-outline"
                        onClick={handleDownloadTemplate}
                    >
                        <span>📋</span>
                        <span>Tải mẫu Excel</span>
                    </button>
                </div>

                {result && (
                    <div className="upload-results">
                        <h3 className="success">
                            <span>✅</span>
                            <span>Thêm mới: {result.addedCount}</span>
                        </h3>
                        {(result.addedQuestions || []).length > 0 && (
                            <ul className="upload-results-list">
                                {result.addedQuestions.map((q, index) => (
                                    <li key={index} className="success">{q}</li>
                                ))}
                            </ul>
                        )}

                        <h3 className="warning">
                            <span>⚠️</span>
                            <span>Trùng lặp: {result.skippedCount}</span>
                        </h3>
                        {(result.skippedQuestions || []).length > 0 && (
                            <ul className="upload-results-list">
                                {result.skippedQuestions.map((q, index) => (
                                    <li key={index} className="warning">{q}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadFileComponent;

import React, { useState } from 'react';
import { uploadDocument } from '../api/participantApi';

export default function DocumentUploadModal({ show, handleClose, profileId, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [documentType, setDocumentType] = useState('ID_PROOF');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.size > 20 * 1024 * 1024) {
            setError('File size must be less than 20MB');
            setFile(null);
            return;
        }
        setError('');
        setFile(selectedFile);
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }

        try {
            setUploading(true);
            setError('');

            const rawBase64 = await convertToBase64(file);

            await uploadDocument(profileId, {
                documentType: documentType,
                base64Content: rawBase64
            });

            onUploadSuccess();
            handleClose();
            setFile(null);
            setDocumentType('ID_PROOF');
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-success text-white">
                        <h5 className="modal-title">Upload Document</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body">
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Document Type</label>
                                <select
                                    className="form-select"
                                    value={documentType}
                                    onChange={(e) => setDocumentType(e.target.value)}
                                    required
                                >
                                    <option value="ID_PROOF">ID Proof</option>
                                    <option value="LICENSE">License</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Select File (Max 20MB)</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept=".pdf,image/png,image/jpeg"
                                    onChange={handleFileChange}
                                    required
                                />
                            </div>
                            <div className="d-flex justify-content-end mt-4">
                                <button type="button" className="btn btn-secondary me-2" onClick={handleClose} disabled={uploading}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-success" disabled={uploading || !file}>
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
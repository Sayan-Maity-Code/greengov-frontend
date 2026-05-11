import React, { useState } from 'react';

const ProgramApplicationForm = ({ program, applicantId, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        programId: program.programId,
        applicantId: applicantId, // Passed from logged-in user context
        submittedDate: new Date().toISOString().split('T')[0],
        status: "PENDING"
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white">
                <h6 className="mb-0">Apply for: {program.title}</h6>
            </div>
            <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label small fw-semibold">Program ID</label>
                            <input type="text" className="form-control bg-light" value={program.programId} readOnly />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-semibold">Applicant ID</label>
                            <input type="text" className="form-control bg-light" value={applicantId} readOnly />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-semibold">Submission Date</label>
                            <input type="date" className="form-control" value={formData.submittedDate} readOnly />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-semibold">Initial Status</label>
                            <input type="text" className="form-control bg-light" value={formData.status} readOnly />
                        </div>
                    </div>
                    <div className="mt-4 d-flex gap-2">
                        <button type="submit" className="btn btn-primary btn-sm">Submit Application</button>
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onCancel}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProgramApplicationForm;
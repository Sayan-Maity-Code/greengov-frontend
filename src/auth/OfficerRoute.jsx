import React from 'react';
import { Navigate } from 'react-router-dom';

const OfficerRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const authorities = payload.authorities || [];
        
        // Check if they are the Environment Officer
        if (authorities.includes("ENVIRONMENT_OFFICER")) {
            return children;
        } else {
            return <Navigate to="/dashboard" replace />; 
        }
    } catch (error) {
        console.error("Token decoding failed", error);
        return <Navigate to="/login" replace />;
    }
};

export default OfficerRoute;
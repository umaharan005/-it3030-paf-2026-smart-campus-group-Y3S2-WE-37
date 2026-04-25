import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * RoleGuard component to protect routes based on user roles.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Component to render if user has the role
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this component
 * @param {string} props.fallbackPath - Path to redirect if unauthorized (default: /unauthorized)
 */
const RoleGuard = ({ children, allowedRoles, fallbackPath = '/unauthorized' }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Spring Boot roles usually come prefixed with ROLE_ if we map them manually,
    // but decoded JWT might just have the enum strings.
    // Our backend PrincipalUser mapping adds ROLE_ prefix.
    const userRoles = user.roles || [];
    const hasAccess = allowedRoles.some(role => 
        userRoles.includes(role) || userRoles.includes(`ROLE_${role}`)
    );

    if (!hasAccess) {
        return <Navigate to={fallbackPath} replace />;
    }

    return children;
};

export default RoleGuard;

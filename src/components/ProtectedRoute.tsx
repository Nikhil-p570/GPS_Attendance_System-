
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading state while authenticating
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user has role but it's not in the allowed roles
  if (user && !allowedRoles.includes(user.role)) {
    // Redirect to the appropriate dashboard based on role
    if (user.role === 'student') {
      return <Navigate to="/student-dashboard" replace />;
    } else if (user.role === 'orgMember') {
      return <Navigate to="/org-member-dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    
    // Default fallback - if somehow the role doesn't match any known role
    return <Navigate to="/login" replace />;
  }

  // If everything is fine, render the children
  return <>{children}</>;
};

export default ProtectedRoute;

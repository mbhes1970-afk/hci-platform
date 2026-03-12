import { Navigate } from 'react-router-dom';
import { useAuth, type Role } from '../hooks/useAuth';

interface Props {
  children: React.ReactNode;
  roles?: Role[];
}

export function AuthGuard({ children, roles }: Props) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}

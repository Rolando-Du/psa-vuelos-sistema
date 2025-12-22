import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; 

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-white text-center mt-10">Cargando...</div>;

  if (!user) return <Navigate to="/login" />;

  if (adminOnly && user.role !== "admin") return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;

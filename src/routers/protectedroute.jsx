import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/authcontext"; 

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
  
    if (loading) return <div>Cargando...</div>;
  
    return user ? children : <Navigate to="/" />;
  };
  
  export default ProtectedRoute;
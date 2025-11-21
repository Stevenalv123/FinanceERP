import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useEffect } from "react";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/login') {
      navigate('dashboard/empresas', { replace: true });
    }
  }, []);

  return (
    <>
      <Outlet/>
    </>
  )
}

export default App

import {createBrowserRouter} from "react-router-dom"
import App from "../App"
import Login from "../pages/login"
import Dashboard from "../pages/dashboard"
import ProtectedRoute from "./protectedroute"

const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
      children: [
        {
          index: true,
          element: <Login />
        },
        {
          path: "dashboard",
          element: (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          )
        }
      ]
    }
  ]);

  export default router;
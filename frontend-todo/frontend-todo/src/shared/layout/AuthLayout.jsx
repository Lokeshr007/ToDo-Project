import { Outlet } from "react-router-dom";

function AuthLayout() {
  // IMPORTANT:
  // Login/Register already have full-page layout.
  // So we simply render the route content.

  return <Outlet />;
}

export default AuthLayout;

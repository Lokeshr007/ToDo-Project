import { Link, useLocation } from "react-router-dom";

function AuthLayout({ children }) {

  const location = useLocation();

  return (

    <div className="min-h-screen grid grid-cols-2">

      {/* LEFT PANEL */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center">

        <div className="px-12 space-y-6">

          <h1 className="text-4xl font-bold">
            TODO.
          </h1>

          <p className="opacity-90 text-lg">
            Organize your work. Track your progress.
          </p>

          <ul className="space-y-2 opacity-80">
            <li>✔ Manage Tasks</li>
            <li>✔ Stay Productive</li>
            <li>✔ Focus Everyday</li>
          </ul>

        </div>

      </div>

      {/* RIGHT FORM PANEL */}
      <div className="flex items-center justify-center bg-gray-100">

        <div className="bg-white p-8 rounded-2xl shadow-xl w-[400px]">

          {/* SWITCH TABS */}
          <div className="flex mb-6">

            <Link
              to="/login"
              className={`flex-1 text-center py-2 ${
                location.pathname === "/login"
                  ? "border-b-2 border-blue-500 font-semibold"
                  : "text-gray-400"
              }`}
            >
              Login
            </Link>

            <Link
              to="/register"
              className={`flex-1 text-center py-2 ${
                location.pathname === "/register"
                  ? "border-b-2 border-blue-500 font-semibold"
                  : "text-gray-400"
              }`}
            >
              Register
            </Link>

          </div>

          {children}

        </div>

      </div>

    </div>

  );
}

export default AuthLayout;

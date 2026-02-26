import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Header(){

  const { logout,user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () =>{
    logout();
    navigate("/");
  }

  return(
    <div>
      <button onClick={handleLogout}>
        Logout
      </button>
      <button onClick={()=> navigate(user ? "/app/dashboard" : "/login")}>
   Get Started
</button>
    </div>
  );
}

export default Header;
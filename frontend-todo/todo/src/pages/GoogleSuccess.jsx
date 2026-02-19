import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function GoogleSuccess(){

   const navigate = useNavigate();

   useEffect(()=>{

      const params = new URLSearchParams(window.location.search);

      const token = params.get("token");

      if(token){
         localStorage.setItem("accessToken", token);
         navigate("/");
      }

   },[]);

   return <div>Logging in...</div>;
}

export default GoogleSuccess;

import {createContext,useContext,useState,useEffect} from "react";
import API from "../services/api"

const AuthContext = createContext();

export function AuthProvider({children}){
   const[user,setUser] = useState(null);
   const[loading,setLoading] = useState(true)

   useEffect(() => {
      const token = localStorage.getItem("accessToken");

      if(token){

         setUser({token})
      }

      setLoading(false);
   },[])

   const login = (tokens) => {
      localStorage.setItem("accessToken",tokens.access)
      localStorage.setItem("refreshToken",tokens.refreshToken);

      setUser(tokens);
   }

   const logout = () =>{
      localStorage.clear();
      setUser(null);
   }

   return (
      <AuthContext.Provider value={{
         user,
         login,
         logout,
         loading
      }}>
         {children}
      </AuthContext.Provider>
   );
}

export const useAuth = () => useContext(AuthContext)
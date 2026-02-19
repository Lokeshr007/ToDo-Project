import { Routes, Route } from "react-router-dom";
import './App.css'
import Login from "./pages/Login";
import Register from "./pages/Register";
import TodoPage from "./pages/TodoPage"; // your main todo UI
import ProductedRoute from "./components/ProtectedRoute";
import GoogleSuccess from "./pages/GoogleSuccess";
import ForgotPassword from "./pages/ForgotPassword";
import ForgotPasswordOtp from "./pages/ForgotPasswordOtp";
import VerifyOtp from "./pages/VerifyOtp";
function App(){

   return(

      <Routes>

         <Route path="/login" element={<Login />} />

         <Route path="/register" element={<Register />} />
         <Route path="/google-success" element={<GoogleSuccess/>}/>
         <Route path="/forgot-password" element = {<ForgotPassword/>}/>
         <Route path="/" element={
            <ProductedRoute>
                   <TodoPage />
            </ProductedRoute>
         } />
         <Route path="/verify-otp" element={<VerifyOtp />} />
         
      </Routes>

   );
}

export default App;

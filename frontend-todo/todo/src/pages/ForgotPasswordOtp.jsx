import { useState, useRef } from "react";
import API from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";

function ForgotPasswordOtp(){

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const [otp,setOtp] = useState(new Array(6).fill(""));
    const inputsRef = useRef([]);

    const handleChange = (e,index)=>{

        const value = e.target.value;

        if(!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // auto focus next
        if(value && index < 5){
            inputsRef.current[index+1].focus();
        }
    };

    const handleKeyDown = (e,index)=>{

        if(e.key === "Backspace" && !otp[index] && index>0){
            inputsRef.current[index-1].focus();
        }
    };

    const handleSubmit = async ()=>{

        const fullOtp = otp.join("");

        await API.post("/auth/forgot-password/verify",{
            email,
            otp: fullOtp
        });

        navigate("/reset-password",{state:{email}});
    };

    return(

        <div className="min-h-screen flex justify-center items-center">

            <div>

                <h2>Enter OTP</h2>

                <div className="flex gap-2">

                    {otp.map((digit,index)=>(
                        <input
                            key={index}
                            type="text"
                            maxLength="1"
                            value={digit}
                            ref={el => inputsRef.current[index] = el}
                            onChange={(e)=>handleChange(e,index)}
                            onKeyDown={(e)=>handleKeyDown(e,index)}
                            className="w-10 h-10 border text-center text-xl"
                        />
                    ))}

                </div>

                <button onClick={handleSubmit}>
                    Verify OTP
                </button>

            </div>

        </div>
    )
}

export default ForgotPasswordOtp;

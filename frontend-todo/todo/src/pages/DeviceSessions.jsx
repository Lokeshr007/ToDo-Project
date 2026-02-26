import { useEffect, useState } from "react";
import API from "../services/api";

function DeviceSessions(){

    const [sessions,setSessions] = useState([]);

    useEffect(()=>{
        fetchSessions();
    },[]);

    const fetchSessions = async ()=>{
        const res = await API.get("/auth/sessions");
        setSessions(res.data);
    }

    const revoke = async(id)=>{
        await API.delete(`/auth/sessions/${id}`);
        fetchSessions();
    }

    return(
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">
                Active Devices
            </h2>

            {sessions.map(s=>(
                <div key={s.id}
                     className="border p-3 rounded mb-3">

                    <p><b>Device:</b> {s.deviceName}</p>
                    <p><b>IP:</b> {s.ipAddress}</p>
                    <p><b>Created:</b> {s.createdAt}</p>

                    <button
                        onClick={()=>revoke(s.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded mt-2"
                    >
                        Logout This Device
                    </button>
                </div>
            ))}
        </div>
    )
}

export default DeviceSessions;

import { useEffect, useState } from "react";
import API from "../services/api";

function Settings() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    API.get("/auth/sessions")
      .then(res => setSessions(res.data));
  }, []);

  const revoke = async (id) => {
    await API.delete(`/auth/sessions/${id}`);
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-900 mb-6">
        Device Sessions
      </h2>

      <div className="space-y-4">
        {sessions.map(s => (
          <div
            key={s.id}
            className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow flex justify-between"
          >
            <span>{s.deviceName}</span>
            <button
              onClick={() => revoke(s.id)}
              className="text-red-600 font-semibold"
            >
              Revoke
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Settings;
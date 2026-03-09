// frontend/src/features/profile/components/tabs/SessionsTab.jsx
import { Smartphone, Laptop } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

function SessionsTab({ sessions, revokeSession, revokeAllSessions }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
        {sessions.length > 1 && (
          <button
            onClick={revokeAllSessions}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Revoke All Others
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {sessions.length > 0 ? (
          sessions.map(session => (
            <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {session.deviceType === 'MOBILE' ? (
                    <Smartphone size={18} className="text-gray-600" />
                  ) : (
                    <Laptop size={18} className="text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {session.deviceName}
                    {session.current && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session.browser} on {session.os} • {session.location}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last active: {session.lastUsed ? formatDistanceToNow(new Date(session.lastUsed), { addSuffix: true }) : 'Now'}
                  </p>
                </div>
              </div>
              {!session.current && (
                <button
                  onClick={() => revokeSession(session.id)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Revoke
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No active sessions</p>
        )}
      </div>
    </div>
  );
}

export default SessionsTab;

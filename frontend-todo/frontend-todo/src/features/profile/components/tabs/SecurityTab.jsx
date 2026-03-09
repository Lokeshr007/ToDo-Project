// frontend/src/features/profile/components/tabs/SecurityTab.jsx
import { Eye, EyeOff, Copy } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';

function SecurityTab({ 
  passwordData, setPasswordData, changePassword,
  twoFactorEnabled, twoFactorData, twoFactorCode, setTwoFactorCode,
  enable2FA, verify2FA, disable2FA,
  showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword,
  showCurrentPassword, setShowCurrentPassword
}) {
  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
          {twoFactorEnabled && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              Enabled
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Add an extra layer of security to your account by requiring a verification code in addition to your password.
        </p>

        {!twoFactorEnabled && !twoFactorData && (
          <button
            onClick={enable2FA}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enable Two-Factor Authentication
          </button>
        )}

        {twoFactorData && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Scan this QR code with your authenticator app:</p>
              <div className="flex justify-center mb-4">
                <QRCodeSVG value={twoFactorData.qrCode} size={200} />
              </div>
              
              <p className="text-sm font-medium mb-2">Or enter this code manually:</p>
              <div className="flex items-center gap-2">
                <code className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono">
                  {twoFactorData.secret}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(twoFactorData.secret)}
                  className="p-2 hover:bg-gray-200 rounded"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Enter verification code:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={verify2FA}
                  disabled={twoFactorCode.length !== 6}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        )}

        {twoFactorEnabled && (
          <button
            onClick={disable2FA}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Disable Two-Factor Authentication
          </button>
        )}
      </div>
    </div>
  );
}

export default SecurityTab;

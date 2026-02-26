// frontend/src/features/profile/pages/ProfilePage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "@/app/providers/AuthContext";
import { 
  User, 
  Activity, 
  Lock, 
  Bell, 
  Settings, 
  Smartphone,
  Loader,
  Camera,
  Check
} from "lucide-react";
import toast from 'react-hot-toast';
import API from "@/services/api";

// Import components
import ProfileHeader from "../components/ProfileHeader";
import ProfileTabs from "../components/ProfileTabs";
import ProfileTab from "../components/tabs/ProfileTab";
import ActivityTab from "../components/tabs/ActivityTab";
import SecurityTab from "../components/tabs/SecurityTab";
import NotificationsTab from "../components/tabs/NotificationsTab";
import PreferencesTab from "../components/tabs/PreferencesTab";
import SessionsTab from "../components/tabs/SessionsTab";
import StatsCard from "../components/sidebar/StatsCard";
import QuickActions from "../components/sidebar/QuickActions";
import BioCard from "../components/sidebar/BioCard";
import DeleteAccountModal from "../modals/DeleteAccountModal";
import { useProfileData } from "../hooks/useProfileData";

function ProfilePage() {
  const { user, logout, updateProfile, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState(false);
  const [coverUploadSuccess, setCoverUploadSuccess] = useState(false);
  
  // Password state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const {
    profile,
    stats,
    sessions,
    activities,
    loading,
    setProfile,
    setSessions,
    refreshProfile,
    fetchProfileData
  } = useProfileData(user);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    location: '',
    company: '',
    jobTitle: '',
    themePreference: 'light',
    emailNotifications: true,
    pushNotifications: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en',
    socialLinks: {
      github: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      facebook: '',
      youtube: '',
      website: ''
    },
    preferences: {
      compactView: false,
      showWeekNumbers: true,
      startWeekOnMonday: true,
      autoSave: true,
      soundEnabled: true,
      desktopNotifications: true
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || user?.name || '',
        email: profile.email || user?.email || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        location: profile.location || '',
        company: profile.company || '',
        jobTitle: profile.jobTitle || '',
        themePreference: profile.themePreference || 'light',
        emailNotifications: profile.emailNotifications !== false,
        pushNotifications: profile.pushNotifications !== false,
        timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: profile.language || 'en',
        socialLinks: profile.socialLinks || {
          github: '',
          twitter: '',
          linkedin: '',
          instagram: '',
          facebook: '',
          youtube: '',
          website: ''
        },
        preferences: profile.preferences || {
          compactView: false,
          showWeekNumbers: true,
          startWeekOnMonday: true,
          autoSave: true,
          soundEnabled: true,
          desktopNotifications: true
        }
      }));
    }
  }, [profile, user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const updatedProfile = await updateProfile(formData);
      setProfile(updatedProfile);
      if (refreshUser) {
        await refreshUser();
      }
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        name: profile.name || user?.name || '',
        email: profile.email || user?.email || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        location: profile.location || '',
        company: profile.company || '',
        jobTitle: profile.jobTitle || '',
        themePreference: profile.themePreference || 'light',
        emailNotifications: profile.emailNotifications !== false,
        pushNotifications: profile.pushNotifications !== false,
        timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: profile.language || 'en',
        socialLinks: profile.socialLinks || {
          github: '',
          twitter: '',
          linkedin: '',
          instagram: '',
          facebook: '',
          youtube: '',
          website: ''
        },
        preferences: profile.preferences || {
          compactView: false,
          showWeekNumbers: true,
          startWeekOnMonday: true,
          autoSave: true,
          soundEnabled: true,
          desktopNotifications: true
        }
      });
    }
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error(`Image size should be less than 5MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    const uploadData = new FormData();
    uploadData.append('avatar', file);

    setUploadingAvatar(true);
    setAvatarUploadSuccess(false);
    
    try {
      const response = await API.post("/users/avatar", uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfile(response.data);
      if (refreshUser) {
        await refreshUser();
      }
      
      setAvatarUploadSuccess(true);
      toast.success(`Avatar uploaded successfully: ${file.name}`);
      
      // Reset success indicator after 3 seconds
      setTimeout(() => setAvatarUploadSuccess(false), 3000);
    } catch (error) {
      console.error("Avatar upload failed:", error);
      const errorMessage = error.response?.data?.message || "Failed to upload avatar";
      toast.error(errorMessage);
    } finally {
      setUploadingAvatar(false);
      // Clear the file input
      e.target.value = '';
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(`Cover image size should be less than 10MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    const uploadData = new FormData();
    uploadData.append('cover', file);

    setUploadingCover(true);
    setCoverUploadSuccess(false);
    
    try {
      const response = await API.post("/users/cover", uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfile(response.data);
      if (refreshUser) {
        await refreshUser();
      }
      
      setCoverUploadSuccess(true);
      toast.success(`Cover photo uploaded successfully: ${file.name}`);
      
      // Reset success indicator after 3 seconds
      setTimeout(() => setCoverUploadSuccess(false), 3000);
    } catch (error) {
      console.error("Cover upload failed:", error);
      const errorMessage = error.response?.data?.message || "Failed to upload cover";
      toast.error(errorMessage);
    } finally {
      setUploadingCover(false);
      // Clear the file input
      e.target.value = '';
    }
  };

  const revokeSession = async (sessionId) => {
    try {
      await API.delete(`/users/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success("Session revoked successfully");
    } catch (error) {
      console.error("Revoke session failed:", error);
      toast.error(error.response?.data?.message || "Failed to revoke session");
    }
  };

  const revokeAllSessions = async () => {
    try {
      await API.delete("/users/sessions");
      refreshProfile();
      toast.success("All other sessions revoked");
    } catch (error) {
      console.error("Revoke all sessions failed:", error);
      toast.error(error.response?.data?.message || "Failed to revoke sessions");
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      await API.post("/users/change-password", passwordData);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success("Password changed successfully");
    } catch (error) {
      console.error("Change password failed:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  const enable2FA = async () => {
    try {
      const response = await API.post("/users/enable-2fa");
      setTwoFactorData({
        secret: response.data.secret,
        qrCode: `otpauth://totp/TodoApp:${formData.email}?secret=${response.data.secret}&issuer=TodoApp`
      });
      toast.success("2FA setup started");
    } catch (error) {
      console.error("Enable 2FA failed:", error);
      toast.error(error.response?.data?.message || "Failed to enable 2FA");
    }
  };

  const verify2FA = async () => {
    if (twoFactorCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    try {
      await API.post(`/users/verify-2fa?code=${twoFactorCode}`);
      setTwoFactorData(null);
      setTwoFactorCode('');
      refreshProfile();
      toast.success("Two-factor authentication enabled");
    } catch (error) {
      console.error("Verify 2FA failed:", error);
      toast.error(error.response?.data?.message || "Invalid verification code");
    }
  };

  const disable2FA = async () => {
    if (!window.confirm("Are you sure you want to disable two-factor authentication?")) return;
    
    try {
      await API.post("/users/disable-2fa");
      refreshProfile();
      toast.success("Two-factor authentication disabled");
    } catch (error) {
      console.error("Disable 2FA failed:", error);
      toast.error(error.response?.data?.message || "Failed to disable 2FA");
    }
  };

  const exportData = async () => {
    setExportLoading(true);
    try {
      const response = await API.get("/users/export");
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `todoapp-export-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(error.response?.data?.message || "Failed to export data");
    } finally {
      setExportLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== formData.email) {
      toast.error("Email confirmation does not match");
      return;
    }

    try {
      await API.delete("/users/account");
      toast.success("Account deleted successfully");
      logout();
    } catch (error) {
      console.error("Delete account failed:", error);
      toast.error(error.response?.data?.message || "Failed to delete account");
    }
  };

  const getInitials = () => {
    if (profile?.name) {
      return profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (profile?.email) {
      return profile.email[0].toUpperCase();
    }
    if (formData.name) {
      return formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (formData.email) {
      return formData.email[0].toUpperCase();
    }
    return 'U';
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Remove duplicate /uploads if present
    const cleanPath = path.replace(/^\/+/, '');
    return `http://localhost:8080/${cleanPath}`;
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'sessions', label: 'Sessions', icon: Smartphone }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Cover Photo */}
      <div className="relative h-56 bg-gradient-to-r from-blue-600 to-purple-600">
        {profile?.coverPhoto && (
          <img 
            src={getImageUrl(profile.coverPhoto)} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        
        {isEditing && (
          <label className={`absolute bottom-4 right-4 px-4 py-2 bg-white/90 backdrop-blur rounded-lg shadow-lg cursor-pointer hover:bg-white transition-colors flex items-center gap-2 z-10 ${
            uploadingCover ? 'opacity-50 cursor-not-allowed' : ''
          }`}>
            {uploadingCover ? (
              <Loader size={16} className="animate-spin" />
            ) : coverUploadSuccess ? (
              <Check size={16} className="text-green-600" />
            ) : (
              <Camera size={16} />
            )}
            {uploadingCover ? 'Uploading...' : coverUploadSuccess ? 'Uploaded!' : 'Change Cover'}
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleCoverUpload}
              disabled={uploadingCover}
            />
          </label>
        )}
      </div>

      {/* Content - Moved up to overlap cover */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-8 relative z-20">
        {/* Profile Header - White background to stand out from cover */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <ProfileHeader 
            profile={profile}
            formData={formData}
            isEditing={isEditing}
            loading={updateLoading}
            uploadingAvatar={uploadingAvatar}
            avatarUploadSuccess={avatarUploadSuccess}
            getInitials={getInitials}
            getImageUrl={getImageUrl}
            onEdit={() => setIsEditing(true)}
            onSave={handleSubmit}
            onCancel={handleCancel}
            onLogout={logout}
            onAvatarUpload={handleAvatarUpload}
          />
        </div>

        <ProfileTabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'profile' && (
              <ProfileTab 
                formData={formData}
                isEditing={isEditing}
                handleInputChange={handleInputChange}
              />
            )}

            {activeTab === 'activity' && (
              <ActivityTab activities={activities} />
            )}

            {activeTab === 'security' && (
              <SecurityTab 
                passwordData={passwordData}
                setPasswordData={setPasswordData}
                changePassword={changePassword}
                twoFactorEnabled={profile?.twoFactorEnabled}
                twoFactorData={twoFactorData}
                twoFactorCode={twoFactorCode}
                setTwoFactorCode={setTwoFactorCode}
                enable2FA={enable2FA}
                verify2FA={verify2FA}
                disable2FA={disable2FA}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                showCurrentPassword={showCurrentPassword}
                setShowCurrentPassword={setShowCurrentPassword}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsTab 
                formData={formData}
                handleInputChange={handleInputChange}
                isEditing={isEditing}
              />
            )}

          {activeTab === 'preferences' && (
            <PreferencesTab 
              formData={formData}
              handleInputChange={handleInputChange}
              isEditing={isEditing}
            />
          )}

            {activeTab === 'sessions' && (
              <SessionsTab 
                sessions={sessions}
                revokeSession={revokeSession}
                revokeAllSessions={revokeAllSessions}
              />
            )}
          </div>

          <div className="space-y-6">
            {stats && <StatsCard stats={stats} />}
            <QuickActions 
              exportData={exportData}
              exportLoading={exportLoading}
              setShowDeleteModal={setShowDeleteModal}
            />
            {formData.bio && <BioCard bio={formData.bio} />}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal 
          email={formData.email}
          deleteConfirm={deleteConfirm}
          setDeleteConfirm={setDeleteConfirm}
          onDelete={deleteAccount}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}

export default ProfilePage;
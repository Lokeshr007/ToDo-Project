// frontend/src/features/profile/components/ProfileHeader.jsx
import { 
  Camera, 
  Edit2, 
  Save, 
  X, 
  LogOut, 
  Loader,
  Mail,
  MapPin,
  Briefcase,
  Phone,
  Github,
  Twitter,
  Linkedin,
  Check
} from "lucide-react";

function ProfileHeader({ 
  profile, 
  formData, 
  isEditing, 
  loading,
  uploadingAvatar,
  avatarUploadSuccess,
  getInitials,
  getImageUrl,
  onEdit,
  onSave,
  onCancel,
  onLogout,
  onAvatarUpload
}) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
      {/* Avatar */}
      <div className="relative group">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white overflow-hidden">
          {profile?.profilePicture ? (
            <img 
              src={getImageUrl(profile.profilePicture)}
              alt={formData.name}
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials()
          )}
        </div>
        
        {isEditing && (
          <label className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg ${
            uploadingAvatar 
              ? 'bg-gray-400 cursor-not-allowed' 
              : avatarUploadSuccess 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
          }`}>
            {uploadingAvatar ? (
              <Loader size={14} className="text-white animate-spin" />
            ) : avatarUploadSuccess ? (
              <Check size={14} className="text-white" />
            ) : (
              <Camera size={14} className="text-white" />
            )}
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={onAvatarUpload}
              disabled={uploadingAvatar}
            />
          </label>
        )}
        
        {/* Upload status tooltip */}
        {avatarUploadSuccess && isEditing && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Uploaded!
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {formData.name || 'Add your name'}
          </h1>
          {!isEditing && (
            <button
              onClick={onEdit}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit profile"
            >
              <Edit2 size={16} className="text-gray-600" />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Mail size={14} />
            {formData.email}
          </span>
          {formData.location && (
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {formData.location}
            </span>
          )}
          {formData.jobTitle && (
            <span className="flex items-center gap-1">
              <Briefcase size={14} />
              {formData.jobTitle} {formData.company && `at ${formData.company}`}
            </span>
          )}
          {formData.phone && (
            <span className="flex items-center gap-1">
              <Phone size={14} />
              {formData.phone}
            </span>
          )}
        </div>

        {/* Social Links */}
        {formData.socialLinks && Object.values(formData.socialLinks).some(Boolean) && (
          <div className="flex gap-2 mt-3">
            {formData.socialLinks.github && (
              <a 
                href={formData.socialLinks.github} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="GitHub"
              >
                <Github size={18} className="text-gray-600" />
              </a>
            )}
            {formData.socialLinks.twitter && (
              <a 
                href={formData.socialLinks.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Twitter"
              >
                <Twitter size={18} className="text-gray-600" />
              </a>
            )}
            {formData.socialLinks.linkedin && (
              <a 
                href={formData.socialLinks.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="LinkedIn"
              >
                <Linkedin size={18} className="text-gray-600" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {isEditing ? (
        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border text-black border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={onLogout}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
        >
          <LogOut size={16} />
          Logout
        </button>
      )}
    </div>
  );
}

export default ProfileHeader;
// frontend/src/features/profile/components/CoverPhoto.jsx
import { Camera, Loader } from "lucide-react";

function CoverPhoto({ coverPhoto, isEditing, uploading, onUpload, getImageUrl }) {
  return (
    <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600">
      {coverPhoto && (
        <img 
          src={getImageUrl(coverPhoto)} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
      )}
      
      {isEditing && (
        <label className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 backdrop-blur rounded-lg shadow-lg cursor-pointer hover:bg-white transition-colors flex items-center gap-2">
          {uploading ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <Camera size={16} />
          )}
          {uploading ? 'Uploading...' : 'Change Cover'}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onUpload}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}

export default CoverPhoto;
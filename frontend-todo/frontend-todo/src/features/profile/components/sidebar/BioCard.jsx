// frontend/src/features/profile/components/sidebar/BioCard.jsx
function BioCard({ bio }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Bio</h3>
      <p className="text-gray-600">{bio}</p>
    </div>
  );
}

export default BioCard;
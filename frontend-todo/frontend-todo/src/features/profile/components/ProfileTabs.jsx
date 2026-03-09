// frontend/src/features/profile/components/ProfileTabs.jsx
function ProfileTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="border-b border-gray-200 mb-6 overflow-x-auto">
      <div className="flex gap-6 min-w-max">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <tab.icon size={16} />
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProfileTabs;

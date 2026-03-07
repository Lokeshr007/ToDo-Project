import { useState, useEffect, useRef } from 'react';
import { Search, Loader, User as UserIcon, X } from 'lucide-react';
import API from '@/services/api';

const UserSearch = ({ onSelect, placeholder = "Search by name or email...", excludeIds = [] }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const response = await API.get(`/users/search?q=${query}`);
          const filteredResults = (response.data || []).filter(u => !excludeIds.includes(u.id));
          setResults(filteredResults);
          setShowDropdown(true);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, excludeIds]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-gray-800/50 border border-purple-500/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm backdrop-blur-sm"
        />
        {query && (
          <button 
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showDropdown && (results.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-purple-500/30 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
          {loading ? (
            <div className="p-4 flex justify-center">
              <Loader size={20} className="animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20">
              {results.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    onSelect(user);
                    setQuery('');
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-purple-600/10 transition-colors text-left group border-b border-white/5 last:border-0"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all font-bold">
                    {user.initials || user.name?.charAt(0) || <UserIcon size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{user.name}</div>
                    <div className="text-xs text-purple-300/60 truncate">{user.email}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {showDropdown && results.length === 0 && !loading && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-purple-500/30 rounded-xl p-4 text-center text-sm text-gray-400 shadow-2xl z-50 backdrop-blur-xl">
          No users found with that email or name.
        </div>
      )}
    </div>
  );
};

export default UserSearch;

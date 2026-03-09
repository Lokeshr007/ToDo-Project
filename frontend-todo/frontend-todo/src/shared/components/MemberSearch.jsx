import React, { useState, useEffect, useRef } from 'react';
import { Search, User, X, Check } from 'lucide-react';
import API from '@/services/api';

const MemberSearch = ({ onSelect, selectedUserId, users = [], label = "Assignee (Email Search)" }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Find the initially selected user from the passed users or fetch if needed
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (selectedUserId) {
      const user = users.find(u => u.id === parseInt(selectedUserId));
      setSelectedUser(user || null);
    } else {
      setSelectedUser(null);
    }
  }, [selectedUserId, users]);

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
    const searchTimer = setTimeout(async () => {
      if (query.length >= 2) {
        setSearching(true);
        try {
          const response = await API.get(`/users/search?q=${query}`);
          setResults(response.data);
          setShowDropdown(true);
        } catch (error) {
          console.error("User search failed:", error);
        } finally {
          setSearching(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query]);

  const handleSelect = (user) => {
    onSelect(user.id);
    setSelectedUser(user);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  const clearSelection = () => {
    onSelect('');
    setSelectedUser(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2 mb-2 ml-1">
        <User size={12} className="text-purple-500" />
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
      </div>
      
      {selectedUser ? (
        <div className="flex items-center justify-between px-4 py-2 bg-purple-600/20 border border-purple-500/50 rounded-lg text-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
              {selectedUser.name ? selectedUser.name[0].toUpperCase() : selectedUser.email[0].toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{selectedUser.name || 'User'}</span>
              <span className="text-xs text-gray-400">{selectedUser.email}</span>
            </div>
          </div>
          <button 
            onClick={clearSelection}
            className="p-1 hover:bg-purple-600/30 rounded-full transition-colors"
          >
            <X size={14} className="text-gray-400 hover:text-white" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowDropdown(true)}
            placeholder="Search by email..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )}

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto overflow-x-hidden">
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelect(user)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-full bg-gray-700 group-hover:bg-purple-600 flex items-center justify-center text-sm font-bold text-white transition-colors">
                {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              {selectedUserId === user.id && (
                <Check size={16} className="text-purple-500" />
              )}
            </button>
          ))}
        </div>
      )}

      {showDropdown && results.length === 0 && query.length >= 2 && !searching && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 text-center">
          <p className="text-sm text-gray-400">No members found matching "{query}"</p>
        </div>
      )}
    </div>
  );
};

export default MemberSearch;

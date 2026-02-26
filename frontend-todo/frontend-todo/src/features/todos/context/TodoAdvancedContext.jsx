import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useGoals } from '../hooks/useGoals';
import { useTimeBlocks } from '../hooks/useTimeBlocks';
import { useReminders } from '../hooks/useReminders';
import { useConsistency } from '../hooks/useConsistency';

const TodoAdvancedContext = createContext();

const initialState = {
  activeFocus: null,
  currentView: 'dashboard',
  filters: {
    goalType: 'all',
    timeRange: 'week',
    priority: 'all'
  },
  ui: {
    sidebarOpen: true,
    showFocusMode: false,
    showTimeCapsule: false
  }
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ACTIVE_FOCUS':
      return { ...state, activeFocus: action.payload };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'UPDATE_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'TOGGLE_SIDEBAR':
      return { ...state, ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen } };
    case 'TOGGLE_FOCUS_MODE':
      return { ...state, ui: { ...state.ui, showFocusMode: !state.ui.showFocusMode } };
    case 'TOGGLE_TIME_CAPSULE':
      return { ...state, ui: { ...state.ui, showTimeCapsule: !state.ui.showTimeCapsule } };
    default:
      return state;
  }
}

export const TodoAdvancedProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const goals = useGoals();
  const timeBlocks = useTimeBlocks();
  const reminders = useReminders();
  const consistency = useConsistency();

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      reminders.refreshReminders();
    }, 60000); // Check reminders every minute

    return () => clearInterval(interval);
  }, []);

  const value = {
    ...state,
    dispatch,
    goals,
    timeBlocks,
    reminders,
    consistency,
    
    // Helper methods
    setActiveFocus: (task) => dispatch({ type: 'SET_ACTIVE_FOCUS', payload: task }),
    setView: (view) => dispatch({ type: 'SET_VIEW', payload: view }),
    updateFilters: (filters) => dispatch({ type: 'UPDATE_FILTERS', payload: filters }),
    toggleFocusMode: () => dispatch({ type: 'TOGGLE_FOCUS_MODE' }),
    toggleTimeCapsule: () => dispatch({ type: 'TOGGLE_TIME_CAPSULE' })
  };

  return (
    <TodoAdvancedContext.Provider value={value}>
      {children}
    </TodoAdvancedContext.Provider>
  );
};

export const useTodoAdvanced = () => {
  const context = useContext(TodoAdvancedContext);
  if (!context) {
    throw new Error('useTodoAdvanced must be used within TodoAdvancedProvider');
  }
  return context;
};
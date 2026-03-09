// frontend/src/features/profile/hooks/useProfileData.js
import { useState, useEffect } from "react";
import API from "@/services/api";
import { taskToast } from '@/shared/components/QuantumToaster';

export const useProfileData = (user) => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = async () => {
    try {
      const response = await API.get("/users/profile");
      setProfile(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      taskToast.error(error.response?.data?.message || "Failed to load profile data");
      return null;
    }
  };

  const fetchStats = async () => {
    try {
      if (!user?.id) {
        console.log("User ID not available yet");
        return;
      }
      
      let response;
      try {
        // Try without userId first (maybe the endpoint doesn't need it)
        response = await API.get("/users/stats");
      } catch (err) {
        console.log("Trying with userId...");
        response = await API.get(`/users/${user.id}/stats`);
      }
      
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      // Set default stats to avoid UI issues
      setStats({
        tasksCompleted: 0,
        projectsCreated: 0,
        daysActive: 0,
        currentStreak: 0,
        productivityScore: 0,
        completionRate: 0,
        focusTime: 0
      });
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await API.get("/users/sessions");
      setSessions(response.data || []);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      setSessions([]);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await API.get("/users/activity?limit=10");
      setActivities(response.data || []);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      setActivities([]);
    }
  };

  const refreshProfile = async () => {
    setLoading(true);
    await Promise.allSettled([
      fetchProfileData(),
      fetchStats(),
      fetchSessions(),
      fetchActivities()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, [user?.id]);

  return {
    profile,
    stats,
    sessions,
    activities,
    loading,
    setProfile,
    setSessions,
    refreshProfile,
    fetchProfileData,
    fetchStats,
    fetchSessions,
    fetchActivities
  };
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/services/api";
import { useNotification } from "@/app/providers/NotificationContext";

export const useProjects = (workspaceId) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  // Fetch projects
  const projectsQuery = useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const response = await API.get("/projects", {
        params: { workspaceId }
      });
      return response.data || [];
    },
    enabled: !!workspaceId,
  });

  // Create project
  const createProjectMutation = useMutation({
    mutationFn: async (newProject) => {
      const response = await API.post("/projects", newProject, {
        params: { workspaceId }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      showNotification("Project created successfully", "success");
    },
    onError: (error) => {
      showNotification(error.response?.data?.error || "Failed to create project", "error");
    },
  });

  // Delete project
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId) => {
      await API.delete(`/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      showNotification("Project deleted successfully", "success");
    },
    onError: () => {
      showNotification("Failed to delete project", "error");
    },
  });

  // Duplicate project
  const duplicateProjectMutation = useMutation({
    mutationFn: async (projectId) => {
      const response = await API.post(`/projects/${projectId}/duplicate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      showNotification("Project duplicated successfully", "success");
    },
    onError: () => {
      showNotification("Failed to duplicate project", "error");
    },
  });

  // Add member
  const addMemberMutation = useMutation({
    mutationFn: async ({ projectId, userId }) => {
      const response = await API.post(`/projects/${projectId}/members/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      showNotification("Member added to project", "success");
    },
    onError: (error) => {
      showNotification(error.response?.data?.error || "Failed to add member", "error");
    },
  });

  // Remove member
  const removeMemberMutation = useMutation({
    mutationFn: async ({ projectId, userId }) => {
      const response = await API.delete(`/projects/${projectId}/members/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      showNotification("Member removed from project", "success");
    },
    onError: (error) => {
      showNotification(error.response?.data?.error || "Failed to remove member", "error");
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    isInitialLoading: projectsQuery.isInitialLoading,
    isError: projectsQuery.isError,
    createProject: createProjectMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutateAsync,
    duplicateProject: duplicateProjectMutation.mutateAsync,
    addMember: addMemberMutation.mutateAsync,
    removeMember: removeMemberMutation.mutateAsync,
    isCreating: createProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
    isDuplicating: duplicateProjectMutation.isPending,
    isAddingMember: addMemberMutation.isPending,
    isRemovingMember: removeMemberMutation.isPending,
  };
};

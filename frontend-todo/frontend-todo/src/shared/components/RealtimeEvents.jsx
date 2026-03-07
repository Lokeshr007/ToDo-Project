import { useEffect } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceContext';
import { useAuth } from '@/app/providers/AuthContext';
import realtimeService from '@/services/realtimeService';
import { taskToast } from '@/shared/components/QuantumToaster';

const RealtimeEvents = () => {
    const { currentWorkspace } = useWorkspace();
    const { user } = useAuth();

    const handleWorkspaceUpdate = (update) => {
        console.log('Real-time update received:', update);

        window.dispatchEvent(new CustomEvent('workspace-update', {
            detail: {
                type: update.type,
                workspaceId: currentWorkspace?.id,
                projectId: update.projectId,
                data: update.data
            }
        }));

        switch (update.type) {
            case 'TASK_CREATED':
                taskToast.success(`New task: ${update.data.item}`);
                break;
            case 'TASK_UPDATED':
                if (update.data.item) {
                    taskToast.info(`Task updated: ${update.data.item}`);
                }
                break;
            case 'TASK_DELETED':
                taskToast.warning('Task removed');
                break;
            case 'PROJECT_GENERATED':
                taskToast.success(`AI Project Created: ${update.data.projectName}`, {
                    duration: 5000,
                    icon: 'rocket'
                });
                break;
            case 'MEMBER_JOINED':
                taskToast.info(`${update.data.name} joined the workspace`);
                break;
            case 'BULK_TASK_UPDATED':
                taskToast.success(`Bulk updated ${update.data.type} for tasks`);
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        if (!user) return;

        let isMounted = true;
        const userTopic = `/topic/user/${user.id}`;
        const workspaceTopic = currentWorkspace ? `/topic/workspace/${currentWorkspace.id}` : null;

        realtimeService.connect(() => {
            if (!isMounted) return;

            realtimeService.subscribe(userTopic, (notification) => {
                taskToast.info(notification.message);
            });

            if (workspaceTopic) {
                realtimeService.subscribe(workspaceTopic, (update) => {
                    handleWorkspaceUpdate(update);
                });
            }
        });

        return () => {
            isMounted = false;
            realtimeService.unsubscribe(userTopic);
            if (workspaceTopic) realtimeService.unsubscribe(workspaceTopic);
        };
    }, [user?.id, currentWorkspace?.id]);

    return null;
};

export default RealtimeEvents;

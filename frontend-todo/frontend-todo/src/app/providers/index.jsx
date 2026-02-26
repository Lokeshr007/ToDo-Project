import { AuthProvider } from './AuthContext';
import { WorkspaceProvider } from './WorkspaceContext';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import { NotificationProvider } from './NotificationContext';
import { TodoProvider } from './TodoContext';

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <ThemeProvider>
          <LanguageProvider>
            <NotificationProvider>
              <TodoProvider>
                {children}
              </TodoProvider>
            </NotificationProvider>
          </LanguageProvider>
        </ThemeProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
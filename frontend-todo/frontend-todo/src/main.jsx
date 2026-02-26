import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import App from "@/App";
import "@/index.css";

// Import all providers
import { AuthProvider } from "@/app/providers/AuthContext";
import { WorkspaceProvider } from "@/app/providers/WorkspaceContext";
import { ThemeProvider } from "@/app/providers/ThemeContext";
import { LanguageProvider } from "@/app/providers/LanguageContext";
import { NotificationProvider } from "@/app/providers/NotificationContext";
import { TodoProvider } from "@/app/providers/TodoContext";
import { ExperienceProvider } from "@/experience/ExperienceContext";

// Experience UI
import CoreLoader from "@/experience/CoreLoader";
import QuantumEntrance from "@/experience/QuantumEntrance";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <NotificationProvider>
            <AuthProvider>
              <WorkspaceProvider>
                <ExperienceProvider>
                  <TodoProvider>
                    <App />

                    {/* Global Systems */}
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: "#1e1e2f",
                          color: "#fff",
                          borderRadius: "12px",
                          border: "1px solid rgba(255,255,255,0.1)",
                        },
                      }}
                    />

                    <CoreLoader />
                    <QuantumEntrance />
                  </TodoProvider>
                </ExperienceProvider>
              </WorkspaceProvider>
            </AuthProvider>
          </NotificationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
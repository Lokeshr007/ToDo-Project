import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import App from "./App";
import "./index.css";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { TodoProvider } from "./context/TodoContext";
import { ExperienceProvider } from "./experience/ExperienceContext";

// Experience UI
import CoreLoader from "./experience/CoreLoader";
import QuantumEntrance from "./experience/QuantumEntrance";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
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
      </ThemeProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
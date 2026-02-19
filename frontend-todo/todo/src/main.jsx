import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { TodoProvider } from './context/TodoContext.jsx'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom"
import {AuthProvider} from "../src/context/AuthContext.jsx"
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AuthProvider>
    <TodoProvider>
      <App/>
    </TodoProvider>
  </AuthProvider> 
  </BrowserRouter>
)
    

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ArchivedHabits from "./pages/ArchivedHabits";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import Admin from "./pages/Admin";
import AddUser from "./pages/AddUser";
import History from "./pages/History";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/archived" element={
                        <ProtectedRoute>
                            <ArchivedHabits />
                        </ProtectedRoute>
                    } />
                    <Route path="/history" element={
                        <ProtectedRoute>
                            <History />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <Admin />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/add-user" element={
                        <ProtectedRoute>
                            <AddUser />
                        </ProtectedRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

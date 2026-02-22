import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Axios Interceptor for Deactivation/Auth failures
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 403 && error.response.data.message.includes("Deactivated")) {
            localStorage.removeItem('user');
            window.location.href = '/login?error=deactivated';
        }
        return Promise.reject(error);
    }
);

// Helper to get auth header
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
    }
    return {};
};

// Local storage helpers for persistence when server is down
const getLocalHabits = () => JSON.parse(localStorage.getItem('habits_fallback')) || [];
const saveLocalHabits = (habits) => localStorage.setItem('habits_fallback', JSON.stringify(habits));

export const fetchHabits = async () => {
    try {
        const response = await axios.get(`${API_URL}/habits`, { headers: getAuthHeader() });
        saveLocalHabits(response.data); // Sync local with server
        return response.data;
    } catch (err) {
        console.warn("Backend unreachable, using local persistence");
        return getLocalHabits();
    }
};

export const createHabit = async (habitData) => {
    try {
        const response = await axios.post(`${API_URL}/habits`, habitData, { headers: getAuthHeader() });
        const habits = getLocalHabits();
        saveLocalHabits([...habits, response.data]);
        return response.data;
    } catch (err) {
        const habits = getLocalHabits();
        const newHabit = {
            _id: 'local_' + Date.now(),
            ...habitData,
            completedDates: [],
            streak: 0,
            isArchived: false,
            createdAt: new Date().toISOString()
        };
        saveLocalHabits([...habits, newHabit]);
        return newHabit;
    }
};

export const toggleHabit = async (id, date) => {
    try {
        const response = await axios.patch(`${API_URL}/habits/${id}/toggle`, { date }, { headers: getAuthHeader() });
        const habits = getLocalHabits().map(h => h._id === id ? response.data : h);
        saveLocalHabits(habits);
        return response.data;
    } catch (err) {
        const habits = getLocalHabits().map(h => {
            if (h._id === id) {
                const dates = [...h.completedDates];
                const index = dates.indexOf(date);
                if (index > -1) dates.splice(index, 1);
                else dates.push(date);
                return { ...h, completedDates: dates };
            }
            return h;
        });
        saveLocalHabits(habits);
        return habits.find(h => h._id === id);
    }
};

export const archiveHabit = async (id, status = true) => {
    try {
        const response = await axios.patch(`${API_URL}/habits/${id}/archive`, { isArchived: status }, { headers: getAuthHeader() });
        const habits = getLocalHabits().map(h => h._id === id ? response.data : h);
        saveLocalHabits(habits);
        return response.data;
    } catch (err) {
        const habits = getLocalHabits().map(h => h._id === id ? { ...h, isArchived: status } : h);
        saveLocalHabits(habits);
        return habits.find(h => h._id === id);
    }
};

export const deleteHabit = async (id) => {
    try {
        await axios.delete(`${API_URL}/habits/${id}`, { headers: getAuthHeader() });
        const habits = getLocalHabits().filter(h => h._id !== id);
        saveLocalHabits(habits);
    } catch (err) {
        const habits = getLocalHabits().filter(h => h._id !== id);
        saveLocalHabits(habits);
    }
};

export const updateHabit = async (id, habitData) => {
    try {
        const response = await axios.put(`${API_URL}/habits/${id}`, habitData, { headers: getAuthHeader() });
        const habits = getLocalHabits().map(h => h._id === id ? response.data : h);
        saveLocalHabits(habits);
        return response.data;
    } catch (err) {
        const habits = getLocalHabits().map(h => h._id === id ? { ...h, ...habitData } : h);
        saveLocalHabits(habits);
        return habits.find(h => h._id === id);
    }
};

export const loginUser = async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
};

export const registerUser = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
};

export const adminCreateUser = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/admin/create-user`, userData, { headers: getAuthHeader() });
    return response.data;
};

export const forgotPassword = async (email) => {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
};

export const resetPassword = async (data) => {
    const response = await axios.post(`${API_URL}/auth/reset-password`, data);
    return response.data;
};

export const adminFetchUsers = async () => {
    const response = await axios.get(`${API_URL}/auth/admin/users`, { headers: getAuthHeader() });
    return response.data;
};

export const adminUpdateUser = async (id, userData) => {
    const response = await axios.put(`${API_URL}/auth/admin/users/${id}`, userData, { headers: getAuthHeader() });
    return response.data;
};

export const adminDeleteUser = async (id) => {
    const response = await axios.delete(`${API_URL}/auth/admin/users/${id}`, { headers: getAuthHeader() });
    return response.data;
};

export const logoutUser = async (durationMinutes) => {
    const response = await axios.post(`${API_URL}/auth/logout`, { durationMinutes }, { headers: getAuthHeader() });
    return response.data;
};

export const recordSessionPulse = async (durationMinutes) => {
    const response = await axios.post(`${API_URL}/auth/session-pulse`, { durationMinutes }, { headers: getAuthHeader() });
    return response.data;
};

export const adminFetchUserIntelligence = async (id) => {
    const response = await axios.get(`${API_URL}/auth/admin/user-intelligence/${id}`, { headers: getAuthHeader() });
    return response.data;
};

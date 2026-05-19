import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../utils/constants';

axios.defaults.baseURL = API_URL;

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/auth/login', { email, password });
      set({ user: response.data.data.user, token: response.data.token, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', isLoading: false });
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/auth/signup', { name, email, password });
      set({ user: response.data.data.user, token: response.data.token, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Signup failed', isLoading: false });
    }
  },

  logout: () => {
    set({ user: null, token: null });
  },

  updatePreference: (language) => {
    set((state) => ({ user: { ...state.user, selectedLanguage: language } }));
  },

  updateLanguage: async (language) => {
    const prev = get().user?.selectedLanguage;
    set((state) => ({ user: { ...state.user, selectedLanguage: language } }));
    try {
      const token = get().token;
      await axios.patch('/auth/me', { selectedLanguage: language }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      set((state) => ({ user: { ...state.user, selectedLanguage: prev } }));
      throw err;
    }
  }
}));

export default useAuthStore;

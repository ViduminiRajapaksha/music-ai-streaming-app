import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshUser = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const profile = await authService.getProfile();
      setUser(profile);
      setIsAuthenticated(true);
    } catch {
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    setIsAuthenticated(true);
    toast.success("Welcome back!");
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    setIsAuthenticated(true);
    toast.success("Account created successfully!");
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.success("Logged out");
  };

  const updateProfile = async (data) => {
    const updated = await authService.updateProfile(data);
    setUser(updated);
    toast.success("Profile updated");
    return updated;
  };

  const uploadProfileImage = async (file) => {
    const profileImage = await authService.uploadProfileImage(file);
    const updated = await authService.getProfile();
    setUser(updated);
    toast.success("Profile image uploaded");
    return profileImage;
  };

  const changePassword = async (data) => {
    await authService.changePassword(data);
    toast.success("Password changed successfully");
  };

  const deleteAccount = async () => {
    await authService.deleteAccount();
    setUser(null);
    setIsAuthenticated(false);
    toast.success("Account deleted");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        uploadProfileImage,
        changePassword,
        deleteAccount,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};

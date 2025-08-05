import { useState, useEffect, useCallback } from 'react';
import localStorageService from '../services/local.service';

// Define proper types for user data
interface UserData {
  id?: string | number;
  token: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  profile_picture?: string;
  profile_image?: string;
  country_code?: string;
  mobile?: string;
  type?: string;
}

export const useUser = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from localStorage on hook initialization
  useEffect(() => {
    try {
      const userRaw = localStorageService.getUser();
      const user = typeof userRaw === "string" ? JSON.parse(userRaw) : userRaw;
      setUserData(user || null);
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to update user data both in state and localStorage
  const updateUserData = useCallback((newUserData: Partial<UserData>) => {
    setUserData(prevData => {
      if (!prevData) return null;
      
      const updatedData = { ...prevData, ...newUserData };
      
      // Update localStorage
      try {
        localStorageService.setUser(JSON.stringify(updatedData));
      } catch (error) {
        console.error("Failed to update user data in localStorage", error);
      }
      
      return updatedData;
    });
  }, []);

  // Function to set complete user data
  const setCompleteUserData = useCallback((newUserData: UserData | null) => {
    setUserData(newUserData);
    
    if (newUserData) {
      try {
        localStorageService.setUser(JSON.stringify(newUserData));
      } catch (error) {
        console.error("Failed to set user data in localStorage", error);
      }
    }
  }, []);

  // Function to clear user data
  const clearUserData = useCallback(() => {
    setUserData(null);
    try {
      localStorageService.removeUser();
    } catch (error) {
      console.error("Failed to clear user data from localStorage", error);
    }
  }, []);

  return {
    userData,
    isLoading,
    updateUserData,
    setCompleteUserData,
    clearUserData,
  };
};

export type { UserData };

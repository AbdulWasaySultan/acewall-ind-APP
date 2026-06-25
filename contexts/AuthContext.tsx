import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredBaseUrl } from '../utils/storage';

type AuthContextType = {
  isAuthenticated: boolean;
  hasSeenLanding: boolean;
  userRole: string | null;
  user: any;
  login: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  markLandingSeen: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSeenLanding, setHasSeenLanding] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication and landing page status on app start
    const checkAuth = async () => {
      try {
        //this block is getting all the values of the respected keys from locals torage asynchronously (calling them all at a time)
        const [auth, landing, userDataString] = await Promise.all([
          AsyncStorage.getItem('isAuthenticated'),
          AsyncStorage.getItem('hasSeenLanding'),
          AsyncStorage.getItem('userData'),
          // AsyncStorage.getItem('selectedBaseUrl'),
        ]);
        const baseUrl = "https://api.acewallscholarslearningonline.org"
        // const basurl = getStoredBaseUrl(); // wasay edition
        setIsAuthenticated(auth === 'true');
        
        // Show landing page only if baseUrl is not saved
        setHasSeenLanding(baseUrl !== null );

        if (auth === 'true' && userDataString) {
          const userData = JSON.parse(userDataString);
          setUserRole(userData.user.role);
          setUser(userData.user);
        }

      } catch (error) {
        console.error('Error checking auth state:', error);
      }
    };
    checkAuth();
  }, []);

  const login = async (userData: any) => {
    try {
      console.log('Login successful', userData);
      await AsyncStorage.setItem('isAuthenticated', 'true');
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      console.log(userData)
      setIsAuthenticated(true);
      setUserRole(userData.user.role);
      setUser(userData.user);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.setItem('isAuthenticated', 'false');
      await AsyncStorage.removeItem('userData');
      // await AsyncStorage.removeItem('selectedBaseUrl');
      // await AsyncStorage.removeItem('hasSeenLanding');
      setIsAuthenticated(false);
      // setHasSeenLanding(false);
      setUserRole("");
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const markLandingSeen = async () => {
    try {
      await AsyncStorage.setItem('hasSeenLanding', 'true');
      setHasSeenLanding(true);
    } catch (error) {
      console.error('Error marking landing as seen:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, hasSeenLanding, userRole, user, login, logout, markLandingSeen }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
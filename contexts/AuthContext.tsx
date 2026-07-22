import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  isAuthenticated: boolean;
  // hasSeenLanding: boolean;
  userRole: string | null;
  user: any;
  isPreviewMode: boolean;
  login: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  enterPreviewMode: (previewUser: any) => Promise<void>;
  exitPreviewMode: (realUser?: any) => Promise<void>;
  // markLandingSeen: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [hasSeenLanding, setHasSeenLanding] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    // Check authentication and landing page status on app start
    const checkAuth = async () => {
      try {
        const [auth, userDataString, previewFlag
          // ,landing
        ] = await Promise.all([
          AsyncStorage.getItem('isAuthenticated'),
          // AsyncStorage.getItem('hasSeenLanding'),
          AsyncStorage.getItem('userData'),
          AsyncStorage.getItem('isPreviewMode'),
          // AsyncStorage.getItem('selectedBaseUrl'),
        ]);
        const baseUrl = "https://api.acewallscholarslearningonline.org"
        setIsAuthenticated(auth === 'true');

        // Show landing page only if baseUrl is not saved
        // setHasSeenLanding(baseUrl !== null );

        const inPreview = previewFlag === 'true';
        setIsPreviewMode(inPreview);

        if (auth === 'true' && userDataString) {
          const userData = JSON.parse(userDataString);
          // While previewing as a student, force the role used for UI gating to
          // "student" regardless of the underlying (teacherAsStudent) role.
          setUserRole(inPreview ? 'student' : userData.user.role);
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
      await AsyncStorage.removeItem('isPreviewMode');
      await AsyncStorage.removeItem('teacherBackupUser');
      // await AsyncStorage.removeItem('selectedBaseUrl');
      // await AsyncStorage.removeItem('hasSeenLanding');
      setIsAuthenticated(false);
      // setHasSeenLanding(false);
      setUserRole("");
      setUser(null);
      setIsPreviewMode(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Switch a teacher's session into "preview as student" mode
  const enterPreviewMode = async (previewUser: any) => {
    if (!previewUser) {
      throw new Error('previewSignIn did not return a user - is the backend up to date?');
    }
    try {
      // Cache the real (pre-preview) user locally so exitPreviewMode can
      // still recover even if the server's response doesn't include one
      // (e.g. a backend that hasn't picked up the latest changes yet).
      if (user) {
        await AsyncStorage.setItem('teacherBackupUser', JSON.stringify(user));
      }
      await AsyncStorage.setItem('userData', JSON.stringify({ user: previewUser }));
      await AsyncStorage.setItem('isPreviewMode', 'true');
      setUserRole('student');
      setUser(previewUser);
      setIsPreviewMode(true);
    } catch (error) {
      console.error('Error entering preview mode:', error);
      throw error;
    }
  };

  // Switch back from "preview as student" mode to the real teacher session
  const exitPreviewMode = async (realUser?: any) => {
    let resolvedUser = realUser;
    if (!resolvedUser) {
      // Fall back to the locally cached teacher user instead of leaving the
      // session stuck in preview mode.
      const backup = await AsyncStorage.getItem('teacherBackupUser');
      if (backup) {
        resolvedUser = JSON.parse(backup);
      }
    }
    if (!resolvedUser) {
      throw new Error('Unable to restore teacher session - no user data available.');
    }
    try {
      await AsyncStorage.setItem('userData', JSON.stringify({ user: resolvedUser }));
      await AsyncStorage.setItem('isPreviewMode', 'false');
      await AsyncStorage.removeItem('teacherBackupUser');
      setUserRole(resolvedUser.role);
      setUser(resolvedUser);
      setIsPreviewMode(false);
    } catch (error) {
      console.error('Error exiting preview mode:', error);
      throw error;
    }
  };

  // const markLandingSeen = async () => {
  //   try {
  //     await AsyncStorage.setItem('hasSeenLanding', 'true');
  //     setHasSeenLanding(true);
  //   } catch (error) {
  //     console.error('Error marking landing as seen:', error);
  //   }
  // };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, user, isPreviewMode, login, logout, enterPreviewMode, exitPreviewMode }}>
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
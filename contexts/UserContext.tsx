import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '../components/aiAssistant/types';

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [taggedMessage, setTaggedMessage] = useState<Message | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem('userData');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed.user || parsed);
      }
    };
    loadUser();
  }, []);

  const updateUser = useCallback(async (newUser: any) => {
    setUser(newUser);
    await AsyncStorage.setItem('userData', JSON.stringify({ user: newUser }));
  }, []);

  const value = useMemo(
    () => ({ user, setUser: updateUser, taggedMessage, setTaggedMessage }),
    [user, updateUser, taggedMessage]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext); 
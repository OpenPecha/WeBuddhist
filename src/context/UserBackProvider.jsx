// UserbackProvider.tsx
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import Userback from '@userback/widget';
import { useAuth0 } from '@auth0/auth0-react';
import {useAuth} from '../config/AuthContext';
import { useQuery } from 'react-query';
import axiosInstance from '../config/axios-config';
export const fetchUserInfo = async () => {
    const { data } = await axiosInstance.get("/api/v1/users/info");
    return data;
  };

const UserbackContext = createContext({ userback: null });

export const UserbackProvider = ({ children }) => {
  const [userback, setUserback] = useState(null);
  const { user } = useAuth0();
    const { isLoggedIn } = useAuth();
    const {
        data: userInfo,
      } = useQuery("userInfo", fetchUserInfo, { refetchOnWindowFocus: false, enabled: isLoggedIn });
    
    const mainUser= user || userInfo 
  useEffect(() => {
    if(!mainUser) return;
    const usebackId = import.meta.env.VITE_USERBACK_ID||"";
    console.log(usebackId,"usebackId")

    const init = async (user) => {
        const id = user?.id || user?.email || 'anonymous';
        const name = user?.name || user?.firstname || 'Anonymous User';
        const email = user?.email || 'anonymous@pecha.io';
      try {
        const options = {
          user_data: {
            id,
            info: {
              name,
              email
            }
          }
        };
        const instance = await Userback(usebackId, options);
        console.log('Userback initialized successfully:', instance);
        setUserback(instance);
        
        
      } catch (error) {
        console.error('Failed to initialize Userback:', error);
        // Add more detailed error information
        console.error('Error details:', {
          message: error?.message,
          stack: error?.stack,
          userbackId: usebackId,
          userData: user
        });
      }
    };
    init(mainUser);
  }, [mainUser]);

  const contextValue = useMemo(() => ({ userback }), [userback]);

  return (
    <UserbackContext.Provider value={contextValue}>
      {children}
    </UserbackContext.Provider>
  );
};

export const useUserback = () => useContext(UserbackContext);



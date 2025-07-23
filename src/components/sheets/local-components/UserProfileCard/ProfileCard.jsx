import React from 'react';
import { useAuth } from '../../../../config/AuthContext.jsx';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../../config/axios-config.js';
import './ProfileCard.scss';
import { useAuth0 } from '@auth0/auth0-react';

export const fetchUserInfo = async () => {
  const { data } = await axiosInstance.get("/api/v1/users/info");
  return data;
};

const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

const ProfileCard = () => {
  const { isLoggedIn } = useAuth();
  const { user } = useAuth0();

  const {
    data: userInfo,
    isLoading: userInfoIsLoading
  } = useQuery("userInfo", fetchUserInfo, { refetchOnWindowFocus: false, enabled: isLoggedIn });


  if (userInfoIsLoading) {
    return <div className="profile-card-loading">Loading...</div>;
  }
  return (
    <div className="profile-card">
      {(userInfo?.username || user?.name) && (
      <div className="profile-card-content">
        <div className="profile-picture-container">
            <img src={userInfo?.avatar_url || user?.picture} alt="Profile" className="profile-image" />
        </div>
        <div className="profile-info">
          <span className="profile-name">{capitalize(userInfo?.firstname || user?.given_name)} {capitalize(userInfo?.lastname || user?.family_name)}</span>
          <span className="profile-title">@{userInfo?.username || user?.nickname}</span>
        </div>
      </div>
         )}
         
    </div>
  );
};

export default ProfileCard
import React, { useEffect } from 'react';
import { useAuth } from '../../../../config/AuthContext.jsx';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../config/axios-config.js';
import './ProfileCard.scss';

const fetchUserInfo = async () => {
  const { data } = await axiosInstance.get("/api/v1/users/info");
  return data;
};

const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

const ProfileCard = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const {
    data: userInfo,
    isLoading: userInfoIsLoading
  } = useQuery("userInfo", fetchUserInfo, { refetchOnWindowFocus: false, enabled: isLoggedIn });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  if (userInfoIsLoading) {
    return <div className="profile-card-loading">Loading...</div>;
  }
  return (
    <div className="profile-card">
            {userInfo?.username && (
      <div className="profile-card-content">
        <div className="profile-picture-container">
      
            <img src={userInfo.avatar_url} alt="Profile" className="profile-image" />
       
        </div>
        <div className="profile-info">
          <span className="profile-name">{capitalize(userInfo?.firstname)} {capitalize(userInfo?.lastname)}</span>
          <span className="profile-title">@{userInfo.username}</span>
        </div>
      </div>
         )}
    </div>
  );
};

export default ProfileCard
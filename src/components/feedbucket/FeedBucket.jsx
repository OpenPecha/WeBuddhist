import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import { MdFeedback } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { useAuth } from "../../config/AuthContext";
import "./FeedBucket.scss";
import { useQuery } from "react-query";
import axiosInstance from "../../config/axios-config";

export const fetchUserInfo = async () => {
    const { data } = await axiosInstance.get("/api/v1/users/info");
    return data;
  };

const FeedbucketId = import.meta.env.VITE_FEEDBUCKET_ID;

function FeedBucket() {
const { user } = useAuth0();
const { isLoggedIn } = useAuth();

const {
    data: userInfo,
    isLoading: userInfoIsLoading
  } = useQuery("userInfo", fetchUserInfo, { refetchOnWindowFocus: false, enabled: isLoggedIn });

const mainUser= user || userInfo // because we are using two ways to login.
  const [show, setShow] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  // Initialize script once
  useEffect(() => {
    if (!FeedbucketId || scriptLoaded ||!show) return;

    const existingScript = document.querySelector(`script[data-feedbucket="${FeedbucketId}"]`);
    if (existingScript) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.defer = true;
    script.src = "https://cdn.feedbucket.app/assets/feedbucket.js";
    script.dataset.feedbucket = FeedbucketId;
    
    script.onload = () => {
      setScriptLoaded(true);
    };
    
    document.head.appendChild(script);
  }, [scriptLoaded, show]);

  const toggleFeedBucket = () => {
    const feedbucket = document.querySelector("feedbucket-app");
    
    if (!show) {
      setShow(true);
      feedbucket?.classList.remove("hidden");
      
    //   Set user config if script is loaded
      if (scriptLoaded && mainUser) {
        window.feedbucketConfig = {
          reporter: {
            name: mainUser.name || mainUser.firstname + " " + mainUser.lastname, // we dont store direct name in local pecha way.
            email: mainUser.email,
          },
        };
      }
    } else {
      setShow(false);
      feedbucket?.classList.add("hidden");
    }
  };

  // Check if user has access
  const hasAccess = (() => {
    if (!mainUser?.email) return false;
    return true;
  })();

  if (!hasAccess) return null;

  return (
    <div className="feedbucket-container">
      <button
        onClick={toggleFeedBucket}
        className={`feedbucket-button ${show ? 'open' : 'closed'}`}
      >
        <div className="button-overlay"></div>
        
        <div className="button-content">
          {show ? (
            <RxCross2 size={24} className="icon" />
          ) : (
            <MdFeedback size={24} className="icon" />
          )}
        </div>
        
        {/* Ripple effect */}
        <div className="ripple-effect"></div>
      </button>
      
      {/* Tooltip */}
      <div className="tooltip">
        {show ? 'Close feedback' : 'Give feedback'}
      </div>
    </div>
  );
}

export default FeedBucket;
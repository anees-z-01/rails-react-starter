import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../providers/AuthProvider";

const RequireAuth = () => {
  const [checkingAuthStatus, setCheckingAuthStatus] = useState(true)
  const auth = useContext(AuthContext);

  const checkAuthStatus = async () => {
    if(auth.authenticated || !localStorage.getItem('access-token')){
      setCheckingAuthStatus(false);
      return;
    }
    try {
      const res = await axios.get("/api/auth/validate_token");
      auth.setUser(res.data.data);
    } catch (err) {
      console.log('unable to validate token')
    } finally {
      setCheckingAuthStatus(false);
    };
  };

  useEffect(()=>{
    checkAuthStatus();
  },[]);

  if(checkingAuthStatus){
    return(<p>Checking if logged in or not</p>);
  }

  if(!auth.authenticated) {
    return <Navigate to="/login" />;
  };

  return <Outlet />
};

export default RequireAuth;

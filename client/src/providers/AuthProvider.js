import Cookies from 'js-cookie';
import React, { useState } from "react";
import axios from "axios";

export const AuthContext = React.createContext();

export const AuthConsumer = AuthContext.Consumer;

const AuthProvider = (props) => {
  const [user, setUser] = useState(null);

  const handleRegister = async (user, navigate) => {
    try {
      let response = await axios.post("api/auth", user);
      setUser(response.data.data);
      navigate("/");
    } catch (err) {
      console.log(err.response.data.errors.full_messages);
      alert(err.response.data.errors.full_messages);
    }
  };

  const handleLogin = async (user, navigate) => {
    try {
      let response = await axios.post("/api/auth/sign_in", user);
      setUser(response.data.data);
      Cookies.set('access-token', response.headers['access-token']);
      Cookies.set('client', response.headers['client']);
      Cookies.set('uid', response.headers['uid']);
      navigate("/");
    } catch (err) {
      console.log(err.response.data.errors.full_messages);
      alert(err.response.data.errors.full_messages);
    }
  };

  const handleLogout = async (navigate) => {
    try {
      let response = await axios.delete("api/auth/sign_out");
      localStorage.removeItem("access-token");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.log(err.response.data.errors.full_messages);
      alert(err.response.data.errors.full_messages);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...user,
        setUser,
        handleRegister,
        handleLogin,
        handleLogout,
        authenticated: user !== null,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

import axios from 'axios';
import Cookies from 'js-cookie';

const defaultHeader = (config) => {
  config.headers['access-token'] = Cookies.get('access-token');
  config.headers['client'] = Cookies.get('client');
  config.headers['uid'] = Cookies.get('uid');
};

const baseApi = () => {
  const defaultOptions = {
    baseURL: import.meta.env.VITE_API_URL ?? '/api',
  };
  const instance = axios.create(defaultOptions);

  instance.interceptors.request.use(
    (config) => {
      defaultHeader(config);
      return config;
    },
    (error) => {
      Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response) => response,
  );

  return instance;
};

export default baseApi();

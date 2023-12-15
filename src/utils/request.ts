/* eslint-disable */
import axios from "axios";
import _ from "lodash";

const getAxiosInstance = (token: any, options = {}) => {
  const headers = {
    ...(token ? { Authorization: "Bearer " + token } : {}),
  };

  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API,
    headers,
    ...options,
  });

  axiosInstance.interceptors.response.use(
    (response) => {
      if ([200, 201].includes(response.status)) {
        const result = response.data;
        if (_.isObject(result.isObject)) {
          result.statusCode = response.status;
        }
        return response.data;
      }
      return Promise.reject(response);
    },
    (error) => {
      let { code } = error.response.data || error.response.status;
      code = code || error.response.status;
      if (code) {
        return Promise.reject(error.response.data);
      }
      return Promise.reject(error.response.data);
    }
  );

  return axiosInstance;
};

const request = (url: any, data = {}, options = {}) => {
  try {
    const { method = "POST", token, ...opts } = options as any;
    const API = getAxiosInstance(token, opts);
    switch (method) {
      case "GET":
        return API.get(url, { params: data });
      case "PUT":
        return API.put(url, data);
      case "DELETE":
        return API.delete(url, data);
      default:
        return API.post(url, data);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

export default request;
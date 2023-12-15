/* eslint-disable */

import request from "../utils/request";

export const userList = async (payload: any, token: any) => {
  return request(`dashboard/users`, payload, { method: "POST", token })
};

export const userDetail = async (payload: any, token: any) => {
  return request(`dashboard/user/${payload}`, {}, { method: "GET", token })
};

export const userUpdate = async (payload: any, token: any) => {
  return request(`dashboard/user`, payload, { method: "PUT", token })
};

export const userUpgrade = async (payload: any, token: any) => {
  return request(`dashboard/user/upgrade`, payload, { method: "POST", token })
};

export const getProfile = async (token: any) => {
  return request("user/profile", {}, { method: "GET", token })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

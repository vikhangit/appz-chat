import React, { useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { Layout, message, Spin } from 'antd';

import './styles.less';
import logo from '../../assets/dumuc/logo.png';
import { auth } from '../../utils/firebase';

const AuthPage = () => {
  const { token } = useParams();
  let navigate = useNavigate();

  useEffect(() => {
    if (token) {
      auth.tenantId = process.env.REACT_APP_TENANT_ID as string;
      auth.signInWithCustomToken(token)
      .then(async (userCredential:any) => {
        console.log(userCredential)
        let url = window.location.href
        let urlRedirect = `${process.env.REACT_APP_COMMUNICAION_URL}/${url.split('/')[3]}`;
        window.location = urlRedirect as Location | (string & Location);
      })
      .catch((error:any) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        message.error(`${errorCode} - ${errorMessage}`)
        navigate(`${process.env.REACT_APP_HOMEPAGE_URL}/auth`)
      });
    }
  }, [token])

  return (
    <Layout className="auth-page">
      <div>
        <Spin />
        <img src={logo} alt="DuMuc" style={{ height: 24, marginLeft: 10 }} />
      </div>
    </Layout>
  )
};

export default AuthPage;
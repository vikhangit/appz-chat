import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Layout } from 'antd';
import { LeftOutlined, UserOutlined } from '@ant-design/icons';


import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import './styles.less';

import logo from '../../assets/dumuc/logo.png';
import { auth } from '../../utils/firebase';
import { getProfile } from '../../apis/users';

const CallPage = () => {
  let navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>()
  const [kitToken, setKitToken] = useState<any>()

  const appConfig = {
      appID: 109576051,
      serverSecret: '2a892c9a4aeac9d56d2d07d905460f6e'
  };

  const randomID = (len: any) => {
      let result = '';
      if (result) return result;
      var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
        maxPos = chars.length,
        i;
      len = len || 5;
      for (i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * maxPos));
      }
      return result;
    }
      
  const getUrlParams = (
      url = window.location.href
    ) => {
      let urlStr = url.split('?')[1];
      return new URLSearchParams(urlStr);
    }

  const roomID = getUrlParams().get('roomID') || randomID(5);
    
  let myMeeting = async (element: any) => {
      // create instance object from token
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      // start the call
      zp.joinRoom({
        container: element,
        sharedLinks: [
          {
            name: 'Personal link',
            url:
              window.location.origin +
              window.location.pathname +
              '?roomID=' +
              roomID,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall, // To implement 1-on-1 calls, modify the parameter here to [ZegoUIKitPrebuilt.OneONoneCall].
        },
      });
  };

  useEffect(() => {
    if (user?.username && loading === false) {
      const kitTokenGenerateByUsername = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appConfig.appID, appConfig.serverSecret, roomID,  `dumuc${user?.username}`,  `dumuc${user?.username}`
      );
      setKitToken(kitTokenGenerateByUsername);
      setLoading(false);
    }
  }, [user?.username, loading])

  useEffect(() => {
    auth.onAuthStateChanged((auth:any) => { 
      if (auth) {
        auth
        .getIdToken(true)
        .then(async(token:any) => {
            //getProfile
            let profile = await getProfile(token);
            setUser(profile);
            setLoading(false)
        });
      } else {
        navigate(`${process.env.REACT_APP_HOMEPAGE_URL}/auth`)
      }
    });
  }, [])

  return (
    <Layout className="chat-page">
      <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
        <div onClick={() => window.location = 'https://staging.dumuc.me' as Location | (string & Location)}  style={{display: 'flex', flexDirection: 'row', marginTop: 10, cursor: 'pointer'}}>
          <div><LeftOutlined /> <span>Back</span></div>
          <img src={logo} alt="DuMuc" style={{ height: 24, marginLeft: 10 }} />
        </div>
        <div style={{marginRight: 24}}>
          {user?.username && (
            <span style={{color: '#c80000', fontWeight: 'bold'}}>
              <UserOutlined /> dumuc{user?.username}
            </span>
          )}
        </div>
      </div>
      <div>
        {loading ?
        <div className="center">
          Đang tải ...
        </div>
        :
        <div ref={myMeeting} style={{ width: '100vw', height: '100vh' }}></div>
        }
      </div>
      
    </Layout>

  )
};

export default CallPage;
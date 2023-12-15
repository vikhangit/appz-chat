import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from 'antd';


import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { LeftOutlined, UserOutlined } from '@ant-design/icons';
import './styles.less';
import logo from '../../assets/dumuc/logo.png';
import { auth } from '../../utils/firebase';
import { getProfile } from '../../apis/users';

const LivestreamPage = () => {
  let navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>()
  const [kitToken, setKitToken] = useState<any>()

  const appConfig = {
      appID: 1317238870,
      serverSecret: 'c23d8befb76fb91c674b0d85b78939d4'
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
      
  const getUrlParams = (url = window.location.href) => {
    let urlStr = url.split('?')[1];
    return new URLSearchParams(urlStr);
  }

 const roomID = getUrlParams().get('roomID') || randomID(5);

 let role_str = getUrlParams(window.location.href).get('role') || 'Host';
  const role =
    role_str === 'Host'
      ? ZegoUIKitPrebuilt.Host
      : role_str === 'Cohost'
      ? ZegoUIKitPrebuilt.Cohost
      : ZegoUIKitPrebuilt.Audience;

  let sharedLinks :any[] = [];

  if (role === ZegoUIKitPrebuilt.Host || role === ZegoUIKitPrebuilt.Cohost) {
    sharedLinks.push({
      name: 'Join as co-host',
      url:
        window.location.protocol + '//' + 
        window.location.host + window.location.pathname +
        '?roomID=' +
        roomID +
        '&role=Cohost',
    });
  }
  sharedLinks.push({
    name: 'Join as audience',
    url:
     window.location.protocol + '//' + 
     window.location.host + window.location.pathname +
      '?roomID=' +
      roomID +
      '&role=Audience',
  });

  useEffect(() => {
    if (user?.username && loading === false) {
      const kitTokenGenerateByUsername =  ZegoUIKitPrebuilt.generateKitTokenForTest(appConfig.appID, appConfig.serverSecret, roomID,  `dumuc${user?.username}`,  `dumuc${user?.username}`);
      setKitToken(kitTokenGenerateByUsername);
      setLoading(false);
    }
  }, [user?.username, loading])
    
  
  // start the call
  let myMeeting = async (element: any) => {
    // Create instance object from Kit Token.
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    // start the call
    zp.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.LiveStreaming,
        config: {
          role,
        },
      },
      sharedLinks,
    });
  };

  useEffect(() => {
    auth.onAuthStateChanged((auth: any) => { 
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
      <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between',}}>
        <div onClick={() => window.location = 'https://staging.dumuc.me' as Location | (string & Location)}  style={{display: 'flex', flexDirection: 'row', marginTop: 10, cursor: 'pointer', paddingLeft: 10}}>
          <div><LeftOutlined /> <span>Back</span></div>
          <img src={logo} alt="DuMuc" style={{ height: 24, marginLeft: 10 }} />
        </div>
        <div style={{marginRight: 24, marginTop: 10}}>
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

export default LivestreamPage;
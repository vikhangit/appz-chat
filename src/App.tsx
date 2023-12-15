import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import './App.css';
import HomeLayout from './layouts/home/home.layout';
import ChatPage from './pages/chat/chat';
import AuthPage from './pages/auth/auth';
import CallPage from './pages/call/call';
import LivestreamPage from './pages/livestream/livestream';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
    <HelmetProvider>
      {process.env.REACT_APP_ENV === 'dumuc' && (
        <Helmet>
          <title>DuMuc - Đồng hành vạn dặm</title>
        </Helmet>
      )}
      {process.env.REACT_APP_ENV === 'prod' && (
        <Helmet>
          <title>AppFunnel - "No Code" App Builder for Building a Community, Sales Funnels and Referral</title>
        </Helmet>
      )}
      <Routes>
        <Route path="/" element={<HomeLayout />}>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:token" element={<AuthPage  />} />
          <Route path="/call" element={<CallPage />} />
          <Route path="/call/:token" element={<AuthPage />} />
          <Route path="/livestream" element={<LivestreamPage />} />
          <Route path="/livestream/:token" element={<AuthPage />} />
        </Route>
      </Routes>
      
    </HelmetProvider>
  </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;

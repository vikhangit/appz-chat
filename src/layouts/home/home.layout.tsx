import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import {useRecoilState} from 'recoil';

import './styles.less';
import { localeAtom } from '../../recoils/atoms';

const HomeLayout = () => {
  const [locale, setLocale] = useRecoilState(localeAtom);

  useEffect(() => {
    if (locale === 'null') {
      setLocale('en')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="home-layout">
      <Outlet />
    </div>
  );
};

export default HomeLayout;

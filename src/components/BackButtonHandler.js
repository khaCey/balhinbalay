import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

const ROOT_PATHS = ['/', '/sale', '/rent'];

export default function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;

    const handler = () => {
      const path = location.pathname;
      if (ROOT_PATHS.includes(path)) {
        App.exitApp();
      } else {
        navigate(-1);
      }
    };

    const listener = App.addListener('backButton', handler);
    return () => {
      listener.then((l) => l.remove());
    };
  }, [location.pathname, navigate]);

  return null;
}

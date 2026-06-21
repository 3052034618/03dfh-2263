import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import './app.scss';

const App: React.FC = (props) => {
  useEffect(() => {}, []);

  useDidShow(() => {});

  useDidHide(() => {});

  return props.children as React.ReactNode;
};

export default App;

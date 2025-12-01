import React from 'react';
import { WebView } from 'react-native-webview';

const MyWebView = () => {

  const handleWebViewMessage = (message: any)=>{console.log(message)}
  return (
    <WebView
      source={{ uri: 'http://192.168.86.249:3001' }} 
      style={{ flex: 1 }}
      onMessage={handleWebViewMessage}  // Listen for messages from the WebView
    />
  );
};

export default MyWebView;
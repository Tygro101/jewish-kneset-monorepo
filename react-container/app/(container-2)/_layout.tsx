import { useColorScheme } from "@/hooks/useColorScheme";
import Constants from "expo-constants";
import { OrientationLock, lockAsync, unlockAsync } from 'expo-screen-orientation';
import { useEffect, useRef } from "react";
import { PixelRatio, Platform, StyleSheet } from "react-native";
import WebView from "react-native-webview";


export const Container = () => {
  const colorScheme = useColorScheme();
  useEffect(() => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      // Lock screen orientation to portrait on mobile
      lockAsync(OrientationLock.LANDSCAPE);
    } else {
      console.log('Screen orientation locking is not supported on the web');
    }

    // Cleanup on unmount
    return () => {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        unlockAsync(); // Unlock orientation if needed
      }
    };
  }, []);
  const webViewRef = useRef(null);
  const sendMessage = () => {
    (webViewRef?.current as any)?.injectJavaScript(`
      window.postMessage('pong');
    `);
  };

  const onMessage = (msg)=> {
    console.log(msg);
    sendMessage();
  }

  return (
    <WebView
      style={styles.container}
      ref={webViewRef}
      source={{ uri: 'http://192.168.86.220:4200' }}
      onMessage={onMessage} 
      webviewDebuggingEnabled={true}
      //injectedJavaScript={`
      //  (function() {
      //    var scale = ${(()=>{
      //      console.log(PixelRatio.get());
      //      PixelRatio.get()
      //    })()};
      //    document.querySelector('meta[name="viewport"]').setAttribute(
      //      'content',
      //      'width=1920, initial-scale=' + (1 / scale)
      //    );
      //  })();
      //`}
    />
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
    width: '100%',
    height: '100%'
  },
});
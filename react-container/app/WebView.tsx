import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import type WebViewType from 'react-native-webview';
import { AppConfig } from '../constants/AppConfig';
import { useConnectivityReload } from '../hooks/useConnectivityReload';

/**
 * Module-level ref to the WebView instance.
 * Used by the connectivity monitor to call .reload() on reconnect.
 * Acceptable pattern because this is a singleton kiosk app.
 */
export let webViewRef: React.RefObject<WebViewType | null> = React.createRef<WebViewType | null>();

/**
 * SmartClockWebView
 *
 * Loads the smart-clock PWA from the public HTTPS host.
 * Configured to enable service workers, DOM storage, and caching so the app
 * works offline after the first successful load.
 *
 * KNOWN LIMITATION: The very first launch requires network connectivity so the
 * service worker can install and precache assets. Subsequent launches work offline.
 *
 * A custom User-Agent is set so the host can optionally gate content to this
 * container only (future feature — not enforced yet).
 */
const SmartClockWebView = () => {
  // Reload the WebView when connectivity transitions from offline → online
  useConnectivityReload(webViewRef);
  const handleMessage = (event: WebViewMessageEvent) => {
    console.log('[WebView message]', event.nativeEvent.data);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('[WebView error]', nativeEvent);
  };

  const handleHttpError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('[WebView HTTP error]', nativeEvent.statusCode, nativeEvent.url);
  };

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: AppConfig.SMART_CLOCK_URL }}
      style={styles.webview}
      // --- Offline / SW / Cache support ---
      javaScriptEnabled={true}
      domStorageEnabled={true}
      cacheEnabled={true}
      // Allow service workers in Android WebView (requires Android 8+).
      // react-native-webview enables this by default on supported versions.
      // --- Rendering ---
      androidLayerType="hardware"
      mediaPlaybackRequiresUserAction={false}
      // --- Security / gating ---
      userAgent={AppConfig.USER_AGENT}
      originWhitelist={['https://*']}
      // --- Error handling ---
      onMessage={handleMessage}
      onError={handleError}
      onHttpError={handleHttpError}
      renderError={(errorDomain, errorCode, errorDesc) => (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ Failed to load Smart Clock</Text>
          <Text style={styles.errorDetail}>{errorDesc} ({errorCode})</Text>
          <Text style={styles.errorHint}>
            Check network connectivity. The app will work offline after the first successful load.
          </Text>
        </View>
      )}
      // Disable navigation away from the clock — origin-locked to HTTPS host
      onShouldStartLoadWithRequest={(request) => {
        // Allow navigation only to the expected HTTPS origin or about:blank (used by service workers)
        return request.url.startsWith(AppConfig.SMART_CLOCK_URL) || request.url === 'about:blank';
      }}
    />
  );
};

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 24,
  },
  errorText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorDetail: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 16,
  },
  errorHint: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default SmartClockWebView;

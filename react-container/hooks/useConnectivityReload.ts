import { useEffect, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import type WebViewType from 'react-native-webview';

/**
 * useConnectivityReload
 *
 * Monitors network connectivity. When the device transitions from offline to online,
 * reloads the provided WebView ref once. This triggers the service worker's update()
 * check, ensuring a new build is picked up promptly after reconnection.
 *
 * Debounced to avoid reload loops on flapping connections.
 */
export function useConnectivityReload(
  webViewRef: React.RefObject<WebViewType | null>
) {
  const wasOfflineRef = useRef<boolean>(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const DEBOUNCE_MS = 3000; // Wait 3s after online edge before reloading

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = !!state.isConnected && !!state.isInternetReachable;

      if (!isConnected) {
        // Mark that we went offline
        wasOfflineRef.current = true;
        // Cancel any pending reload
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
          debounceRef.current = null;
        }
        return;
      }

      // Online: if we were previously offline, schedule a reload
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;

        // Debounce to avoid reload on connection flapping
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          debounceRef.current = null;
          webViewRef.current?.reload();
          console.log('[Connectivity] Network restored — reloading WebView to check for updates.');
        }, DEBOUNCE_MS);
      }
    });

    return () => {
      unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [webViewRef]);
}

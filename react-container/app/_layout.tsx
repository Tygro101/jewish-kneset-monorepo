import { useEffect } from "react";
import { Stack } from "expo-router";
import { activateKeepAwakeAsync } from "expo-keep-awake";
import * as ScreenOrientation from "expo-screen-orientation";

export default function RootLayout() {
  useEffect(() => {
    // --- Kiosk hardening ---
    // Prevent the screen from sleeping (wall display, always-on).
    activateKeepAwakeAsync().catch((err) =>
      console.warn("[KeepAwake] Failed to activate:", err)
    );

    // Lock orientation to portrait.
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    ).catch((err) =>
      console.warn("[Orientation] Failed to lock:", err)
    );
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        statusBarHidden: true,
        title: "",
        // Fullscreen: no system UI overlays
        navigationBarHidden: true,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}

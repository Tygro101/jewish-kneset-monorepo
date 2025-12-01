import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false , statusBarHidden: true, title: ''}}>
      <Stack.Screen name="index" />
    </Stack>
  );
}

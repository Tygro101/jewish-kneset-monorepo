import { useColorScheme } from "@/hooks/useColorScheme";
import Constants from "expo-constants";
import { OrientationLock, lockAsync } from 'expo-screen-orientation';
import WebView from "react-native-webview";
import { StyleSheet } from 'react-native';



export const container = () => {
    const colorScheme = useColorScheme();
    console.log(colorScheme);

    const changeScreenOrientation = async () => {
        await lockAsync(OrientationLock.LANDSCAPE);
    }

    changeScreenOrientation();
    return (
        <WebView
        style={styles.container}
        source={{ uri: 'https://expo.dev' }}
      />
    )


}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: Constants.statusBarHeight,
    },
  });
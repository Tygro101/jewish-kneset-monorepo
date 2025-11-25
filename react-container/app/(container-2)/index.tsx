import { useColorScheme } from "@/hooks/useColorScheme";
import { OrientationLock, lockAsync } from 'expo-screen-orientation';


export const container = () => {
    const colorScheme = useColorScheme();
    console.log(colorScheme);

    const changeScreenOrientation = async () => {
        await lockAsync(OrientationLock.LANDSCAPE);
    }
    return (
        <div>container</div>
    )


}
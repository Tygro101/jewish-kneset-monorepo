import { useEffect } from "react";
import { format } from 'date-fns';



export const ClockContainer = (props: any) => {
    let currentDate = new Date();
    useEffect(() => {

        let handle = setInterval(() => {
            currentDate = new Date();
        }, 1000);
        return () => {
            clearInterval(handle);
        }
    }, [])

    return <div>
        {format(currentDate, 'HH:mm:ss')}
    </div>
}
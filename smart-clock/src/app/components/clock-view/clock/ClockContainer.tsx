import { useEffect, useState } from "react";
import { format } from 'date-fns';
import './ClockContainer.scss';



export const ClockContainer = (props: any) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    useEffect(() => {

        let handle = setInterval(() => {
            setCurrentDate(new Date());
        }, 1000);
        return () => {
            clearInterval(handle);
        }
    }, []);
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');

    return <div className="clock-content">
        {hours}:{minutes}:{seconds}
    </div>
}
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
    }, [])

    return <div className="clock-content">
        <div className="hours">{format(currentDate, 'HH')}</div>
        <div>:</div>
        <div className="minutes">{format(currentDate, 'mm')}</div>
        <div className="seconds-divider">:</div>
        <div className="seconds">{format(currentDate, 'ss')}</div>

    </div>
}
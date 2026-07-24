import { useEffect, useState } from "react";
import { useAppSelector } from "../../../hooks";
import { getTimesSelector } from "../../store/times/timesSelectors";
import {
    getNetzCountdownEnabledSelector,
    getNetzCountdownMinutesSelector,
} from "../../store/settings/settingsSelectors";
import { TimesKeys } from "@shared/core/services/workers/handlers/constants/times.keys";
import { getNetzCountdown, formatCountdown } from "./netzCountdown";
import './ClockContainer.scss';

export const ClockContainer = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const times = useAppSelector(getTimesSelector);
    const enabled = useAppSelector(getNetzCountdownEnabledSelector);
    const windowMinutes = useAppSelector(getNetzCountdownMinutesSelector);

    useEffect(() => {
        const handle = setInterval(() => {
            setCurrentDate(new Date());
        }, 1000);
        return () => clearInterval(handle);
    }, []);

    // Netz ISO date string (or null when not loaded yet).
    const netzEntry = times?.[TimesKeys.Netz as unknown as string];
    const netzDate: string | null = netzEntry?.date ?? null;

    // Decide if the countdown should be shown right now.
    const countdown = enabled
        ? getNetzCountdown(netzDate, currentDate, windowMinutes)
        : { active: false, remainingMs: 0 };

    if (countdown.active) {
        const text = formatCountdown(countdown.remainingMs); // "MM:SS"
        const [mm, ss] = text.split(':');
        return (
            <div className="clock-content countdown" aria-label="ספירה לאחור להנץ">
                <span className="clock-segment">{mm}</span>
                <span className="clock-colon blink">:</span>
                <span className="clock-segment">{ss}</span>
            </div>
        );
    }

    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');

    return (
        <div className="clock-content">
            <span className="clock-segment">{hours}</span>
            <span className="clock-colon blink">:</span>
            <span className="clock-segment">{minutes}</span>
            <span className="clock-colon blink">:</span>
            <span className="clock-segment">{seconds}</span>
        </div>
    );
};

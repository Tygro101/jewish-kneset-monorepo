import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import './TimeContainer.scss';
import { calculateTimes } from './store/timeSlice';
import { getTimesSelector } from './store/timeSelectors';
import { Column } from '../days-container/columns-container/column/Column';

export const TimeContainer = (props: any) => {
    const dispatch = useAppDispatch();
    const times = useAppSelector(getTimesSelector);
    const timesMemo = useMemo(() => times, [times]);
    useEffect(() => {
        dispatch(calculateTimes(""));
        //setTimeout(() => {
        //    dispatch(calculateTimes(""))
        //})
    }, [])

    return <div className='columns-container'>
        {

        }
    </div>



}

import { PrayCardContainer } from '../cards/PrayCardContainer';
import './Column.scss';
export const Column = (props: any) => {
    return <div className='column'>
        {
            [1,2,3].map(_=> <div className="title">
                יום שבת
            </div>)
        }
        {
            
        [1, 2, 3].map(item => <PrayCardContainer></PrayCardContainer>)}
    </div>
}
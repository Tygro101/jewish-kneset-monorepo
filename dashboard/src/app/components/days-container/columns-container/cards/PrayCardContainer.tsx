import './PrayCardContainer.scss';

export const PrayCardContainer = (props: any) =>{
    return <div className='column-card'>
    <div className='column-card-title'>
        <div className='column-card-name'>
            <div>תפילת שחרית</div>
            <div className='column-card-description'>
                הודו 20 דק לפני הנץ
            </div>
        </div>
        <div className='column-card-time'>
            7:30
        </div>
    </div>
</div>
}
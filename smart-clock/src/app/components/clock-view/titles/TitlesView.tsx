import { IClockTitle } from "@shared/core/services/workers/handlers/models/shared-models";
import { TypedObjectMap } from "@shared/models/core";
import { TitlesKeys } from '@shared/core/services/workers/handlers/models/titles-of-aiom';
import SunIcon from '../../../../assets/icons/sun.svg?raw';
import SunriseIcon from '../../../../assets/icons/sunrise.svg?raw';
import SunsetIcon from '../../../../assets/icons/sunset.svg?raw';
import RainIcon from '../../../../assets/icons/cloud-rain.svg?raw';
import DropIcon from '../../../../assets/icons/droplet.svg?raw';
import MoonIcon from '../../../../assets/icons/moon.svg?raw';
import RippleIcon from '../../../../assets/icons/ripple.svg?raw';
import BookIcon from '../../../../assets/icons/book.svg?raw';

import './TitlesView.scss';


export type TitlesProps = {
    titles: TypedObjectMap<IClockTitle>
    containerRef?: React.RefObject<HTMLDivElement>
}
const iconsMap: TypedObjectMap<{ icon: string; color: string }> = {
    [TitlesKeys.HebrewDate]: { icon: SunriseIcon, color: 'orange' },
    [TitlesKeys.MashivAruach]: { icon: RainIcon, color: '#51a2ff' },
    [TitlesKeys.MoridAtal]: { icon: DropIcon, color: '#51a2ff' },
    [TitlesKeys.BarechAlino]: { icon: RainIcon, color: '#51a2ff' },
    [TitlesKeys.Barechino]: { icon: MoonIcon, color: 'orange' },
    [TitlesKeys.BirkatLevana]: { icon: MoonIcon, color: 'orange' },
    [TitlesKeys.SefiratHaOmer]: { icon: RippleIcon, color: 'orange' },
    [TitlesKeys.DafYomi]: { icon: BookIcon, color: '#74d4ff' },
    [TitlesKeys.YerushalmiYomi]: { icon: BookIcon, color: '#74d4ff' },
    default: { icon: SunIcon, color: 'orange' }
};

const ignoreTitlesMap: TypedObjectMap<boolean> = {
    [TitlesKeys.HebrewDate]: true
}

export const TitlesContainer = (props: TitlesProps) => {

    return <div className="titles-container" ref={props.containerRef}>
        {Object.keys(props?.titles ?? {}).filter(key => !ignoreTitlesMap[key]).map(key => {
            const tkey = key as TitlesKeys;
            const iconObj = iconsMap[tkey] ?? iconsMap.default;
            return <div className="title" key={key}>
                <span className="icon" style={{ color: iconObj.color }} dangerouslySetInnerHTML={{ __html: iconObj.icon }} />
                {props.titles[key]?.prefix ? <span>{props.titles[key]?.prefix}:</span> : ''}
                {props.titles[key].title}
            </div>
        })}
    </div>
}
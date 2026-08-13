import { IClockTitle } from "@shared/core/services/workers/handlers/models/shared-models";
import { TypedObjectMap } from "@shared/models/core";
import { groupTitles, groups } from './titlesGrouping';
import './TitlesView.scss';

// Re-export so DashboardHeader's existing import keeps working.
export { getCalendarHeadline } from './titlesGrouping';

export type TitlesProps = {
    titles: TypedObjectMap<IClockTitle>;
};

export const TitlesContainer = (props: TitlesProps) => {
    const { titles } = props;
    const grouped = groupTitles(titles);

    return (
        <div className="info-cards" data-fit-measure>
            {groups.map((group) => {
                const items = grouped[group.id];
                if (!items.length) return null;

                return (
                    <div key={group.id} className="info-card">
                        <div className="info-card-header">
                            <span className="info-card-title">{group.title}</span>
                        </div>
                        <div className="info-card-body">
                            {items.map((item, i) => (
                                <div
                                    key={`${group.id}-${item.label}-${item.value}-${i}`}
                                    className={`info-card-row ${i < items.length - 1 ? 'has-border' : ''}`}
                                >
                                    <span className="info-card-label">{item.label}</span>
                                    <span className="info-card-divider" />
                                    <span className="info-card-value">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

import { ColumnsContainer } from "../days-container/columns-container/ColumnsContainer";
import { Column } from "../days-container/columns-container/column/Column"
import { TimeContainer } from "../time-container/TimeContainer"
import './ContentContainer.scss';

export const ContentContainer = () => {


    return <div className="content-container">
        <TimeContainer></TimeContainer>
        <ColumnsContainer></ColumnsContainer>

    </div>
}
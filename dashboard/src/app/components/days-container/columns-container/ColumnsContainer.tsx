import { Column } from "./column/Column"
import './ColumnsContainer.scss';

export const ColumnsContainer = (props: any) => {


    return <div className="columns-container">
        {
            [1, 2, 3].map(_ =>
                <Column></Column>
            )
        }
    </div>
}
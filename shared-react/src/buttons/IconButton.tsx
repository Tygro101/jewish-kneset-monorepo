

import './IconButton.scss';
export const IconButton = (props: { icon: string }) => {

    return <div className="icon-button">
        <div className="icon" style={{ inlineSize: '22px', blockSize: '22px'}} dangerouslySetInnerHTML={{ __html: props.icon }} />
    </div>
}
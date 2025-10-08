import { Q2Widget, Q2WidgetProps } from './Widget';
import React from 'react';


interface Q2ImageProps extends Q2WidgetProps { }

export class Q2Image extends Q2Widget<Q2ImageProps> {
    imageRef = React.createRef<HTMLImageElement>();

    constructor(props: Q2ImageProps) {
        super(props);
        console.log("co")
    }

    render() {
        const { column } = this.props;
        console.log("==", column)
        return (
            <>
                {column?.label}
                <img className={"Q2Image" + " " + column.class}
                    onClick={column.valid}
                    alt={column.label}
                    src={column.data}
                    ref={this.imageRef}
                >
                </img>
            </>
        );
    }
}

export default Q2Image;

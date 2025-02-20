import { Component } from 'react';

class Spacer extends Component {
    constructor(props: any) {
        super(props);
    }

    render() {
        const style = {
            flexGrow: 1, // Allow the spacer to take up remaining space
            height: 'auto',
            width: '100%'
        };

        return <div className="Q2Spacer" style={style}></div>;
    }
}

export default Spacer;

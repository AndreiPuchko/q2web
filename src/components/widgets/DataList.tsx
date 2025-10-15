import { } from "./DataList.css"
import { Component } from "react";
import { Q2Form, Q2Control } from "../q2_modules/Q2Form";



interface Q2DataListState {
    visibleRows: number,
    selectedRow: number,
    data: Array<any>,
    loading: boolean;
    error: string | null;
}

interface Q2DataListProps {
    q2form: Q2Form;
}

export class Q2DataList extends Component<Q2DataListProps, Q2DataListState> {

    renderHeader() {
        const { columns } = this.props.q2form;
        return <div className="Q2DataList-header" >
            {columns.map((column, _) => {
                return <div key={_} className="Q2DataList-header-cell">
                    <b>{column.label}</b>
                </div>
            })
            }
        </div>
    }

    renderRow(row, index) {
        const { columns } = this.props.q2form;
        return <div   key={index}  className="Q2DataList-row" >
            {columns.map((column, _) => {
                return <div key={column.column} className="Q2DataList-cell">
                    {`${index} ${row[column.column]}`}
                </div>
            })
            }
        </div>
    }

    render() {
        return (<div className="Q2DataList">
            {this.renderHeader()}
            <div className="Q2DataList-scrollarea">
                <div>
                    {
                        this.props.q2form.data.map((row, index) => this.renderRow(row, index))
                    }
                </div>
            </div>
        </div>)
    }
}

export default Q2DataList;
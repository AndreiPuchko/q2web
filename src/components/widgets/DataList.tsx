import { } from "./DataList.css"
import { Component, createRef } from "react";
import { Q2Form } from "../../q2_modules/Q2Form";

interface Q2DataListState {
  visibleRows: number,
  selectedRow: number,
  data: Array<any>,
  colWidths: Array<number>,
  columnOrder: Array<number>,
  dragIndex: number | null,
  loading: boolean;
  error: string | null;
}

interface Q2DataListProps {
  q2form: Q2Form;
}

export class Q2DataList extends Component<Q2DataListProps, Q2DataListState> {
  resizeColumns: boolean | undefined;
  reorderColumns: boolean | undefined;
  private scrollbarSpacer = createRef<HTMLDivElement>();
  private scrollArea = createRef<HTMLDivElement>();
  private resizeObserver?: ResizeObserver;

  constructor(props: Q2DataListProps) {
    super(props);
    const { columns } = props.q2form;
    this.state = {
      visibleRows: 0,
      selectedRow: 0,
      loading: false,
      error: null,
      colWidths: columns.map(() => 150),
      columnOrder: columns.map((_, i) => i),
      dragIndex: null,
      // data: props.q2form.data,
      data: Array.isArray(props.q2form.data) ? props.q2form.data : [],
    };
    this.resizeColumns = this.props.q2form.dataGridParams.resizeColumns;
    this.reorderColumns = this.props.q2form.dataGridParams.reorderColumns;
  }

  async componentDidMount() {
    if (this.props.q2form.dataGridParams.loader) {
      await this.fetchData();
    }
    this.updateScrollbarSpacer();

    if (this.scrollArea.current) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateScrollbarSpacer();
      });

      this.resizeObserver.observe(this.scrollArea.current);
    }
  }

  componentDidUpdate() {
    this.updateScrollbarSpacer();
  }

  updateScrollbarSpacer = () => {
    const spacer = this.scrollbarSpacer.current;
    if (!spacer) return;

    spacer.style.width = `${this.getScrollbarWidth()}px`;
  };

  async fetchData() {
    if (!this.props.q2form.dataGridParams.loader) return;
    try {
      const data = await this.props.q2form.dataGridParams.loader();
      this.setState({ data: [...data], loading: false });
      return data
    }
    catch (err: any) {
      this.setState({ error: err.message, loading: false });
      return err
    }
  }

  getScrollbarWidth = (): number => {
    const element = this.scrollArea.current;
    if (!element) return 0;

    const fullWidth = element.offsetWidth;
    const contentWidth = element.clientWidth;

    const style = window.getComputedStyle(element);
    const borderLeft = parseFloat(style.borderLeftWidth) || 0;
    const borderRight = parseFloat(style.borderRightWidth) || 0;

    const scrollbarWidth = fullWidth - contentWidth - borderLeft - borderRight;

    return scrollbarWidth > 0 ? scrollbarWidth : 0;
  }

  handleRowClick = (rowIndex: any) => {
    this.setState({ selectedRow: rowIndex }, () => {
      if (typeof this.props.q2form?.hookDataGridRowClicked === "function") {
        this.props.q2form.hookDataGridRowClicked(this);
      }
    })


  }

  // ==========================
  // COLUMN RESIZING
  // ==========================
  startResize = (index: number, e: any) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = this.state.colWidths[index];

    const onMouseMove = (moveEvent: any) => {
      const delta = moveEvent.clientX - startX;
      this.setState((prev) => {
        const newWidths = [...prev.colWidths];
        newWidths[index] = Math.max(50, startWidth + delta);
        return { colWidths: newWidths };
      });
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // ==========================
  // COLUMN DRAGGING
  // ==========================
  onDragStart = (index: number, e: any) => {
    if (!this.reorderColumns) return
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index);
    this.setState({ dragIndex: index });
  };

  onDragOver = (index: number, e: any) => {
    e.preventDefault();
    const { dragIndex, columnOrder } = this.state;

    if (dragIndex === index || dragIndex === null) return;

    const newOrder = [...columnOrder];
    newOrder.splice(
      index,
      0,
      newOrder.splice(dragIndex, 1)[0]
    );

    this.setState({ columnOrder: newOrder, dragIndex: index });
  };

  onDrop = () => {
    this.setState({ dragIndex: null });
  };

  // ==========================
  // RENDER
  // ==========================
  renderHeader() {
    const { columns } = this.props.q2form;
    const { colWidths, columnOrder } = this.state;
    return (
      <div className="Q2DataList-header">
        {columnOrder.map((colIdx, i) => {
          const column = columns[colIdx];
          const width = this.resizeColumns ? `${colWidths[colIdx]}px` : "auto";
          return (

            <div
              key={colIdx}
              className="Q2DataList-header-cell"
              style={{
                flex: `1 1 ${width}`,
                width: `${width}`,
                boxSizing: "border-box",
              }}
              {...(this.reorderColumns && {
                draggable: true,
                onDragStart: (e) => this.onDragStart(i, e),
                onDragOver: (e) => this.onDragOver(i, e),
                onDrop: this.onDrop
              })
              }
            >
              <b>{column.label}</b>
              {
                this.resizeColumns &&
                <div
                  className="Q2DataList-resizer"
                  onMouseDown={(e) => this.startResize(colIdx, e)}
                />
              }
            </div>
          );
        })
        }
        <div ref={this.scrollbarSpacer}></div>
      </div >
    );
  }

  renderRow(row: any, rowIndex: number) {
    const { columns } = this.props.q2form;
    const { colWidths, columnOrder, selectedRow } = this.state;
    const isSelected = selectedRow === rowIndex
    let className = "Q2DataList-row";
    className += rowIndex % 2 === 0 ? " even" : " odd";
    if (isSelected) {
      className += " selected"
    }
    return (
      <div key={rowIndex} className={className}
        onClick={() => this.handleRowClick(rowIndex)}
      >
        {columnOrder.map((colIdx) => {
          const column = columns[colIdx];
          const width = this.resizeColumns ? `${colWidths[colIdx]}px` : "auto";
          return (
            <div
              key={column.column}
              className={`Q2DataList-cell ${rowIndex === 0 ? "first-row" : ""}`}
              style={{
                flex: `1 1 ${width}`,
                width: `${width}px`,
                boxSizing: "border-box",
              }}
            >
              {`${row[column.column]}`}
            </div>
          );
        })
        }
      </div >
    );
  }

  render() {
    const { q2form } = this.props;
    const { data } = this.state;
    if (!Array.isArray(data)) {
      return <div>No data provided</div>
    }
    else {
      return (
        <div className={`Q2DataList ${this.props.q2form.class}`}>
          {q2form.dataGridParams.showHeaders && this.renderHeader()}
          <div ref={this.scrollArea} className="Q2DataList-scrollarea" >
            <div>
              {data.map((row, index) => this.renderRow(row, index))}
            </div>
          </div>
        </div>
      );
    }
  }
}

export default Q2DataList;
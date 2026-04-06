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
  contextMenu?: { x: number; y: number; }
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
      data: Array.isArray(props.q2form.data) ? props.q2form.data : [],
      contextMenu: undefined,
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
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentDidUpdate() {
    this.updateScrollbarSpacer();
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    // this.resizeObserver.disconnect();
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

  handleContextMenu = (e: React.MouseEvent, rowIndex) => {
    e.preventDefault();
    console.log(9999, rowIndex)
    this.setState({
      contextMenu: { x: e.clientX, y: e.clientY }, selectedRow: rowIndex
    });
  };


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

  handleKeyDown = (event: any) => {
    const { selectedRow, data } = this.state;
    const dataLength = data.length;

    if (event.key === "PageDown") {
      // if (last >= dataLength - 1) return;
      const { last } = this.getVisibleRange();

      let newRow = Math.min(last + 1, dataLength - 1);
      if (last === dataLength) {
        newRow = dataLength - 1
      }

      this.setState({ selectedRow: newRow }, () => {
        this.scrollToRow();
        this.scrollPage("down");
      });

    } else if (event.key === "PageUp") {
      // if (first <= 0) return;

      const newRow = this.getPageUp();

      this.setState({ selectedRow: newRow }, () => {
        this.scrollToRow();
      });

    } else if (event.key === "ArrowUp" && selectedRow > 0) {
      this.setState({ selectedRow: selectedRow - 1 }, this.scrollToRow);

    } else if (event.key === "ArrowDown" && selectedRow < dataLength - 1) {
      this.setState({ selectedRow: selectedRow + 1 }, this.scrollToRow);

    } else if (event.key === "Home") {
      this.setState({ selectedRow: 0 }, () => {
        this.scrollToRow();
      });

    } else if (event.key === "End") {
      this.setState({ selectedRow: dataLength - 1 }, () => {
        this.scrollToRow();
      });
    }

    event.preventDefault();
  };

  getPageUp = (): number => {
    const container = this.scrollArea?.current;
    if (!container) return 0;

    const rowsWrapper = container.firstElementChild;
    if (!rowsWrapper) return 0;

    const rows = rowsWrapper.children;

    const { first } = this.getVisibleRange();

    if (first <= 0) return 0;

    let totalHeight = 0;
    let targetIndex = first;

    for (let i = first - 1; i >= 0; i--) {
      const row = rows[i] as HTMLElement;
      const height = row.getBoundingClientRect().height;

      if (totalHeight + height > container.clientHeight) {
        break;
      }

      totalHeight += height;
      targetIndex = i;
    }

    return targetIndex;
  };

  getVisibleRange = () => {
    const container = this.scrollArea?.current;
    if (!container) return { first: 0, last: 0 };

    const rowsWrapper = container.firstElementChild;
    if (!rowsWrapper) return { first: 0, last: 0 };

    const rows = rowsWrapper.children;

    const viewTop = container.scrollTop;
    const viewBottom = viewTop + container.clientHeight;

    let firstFullyVisible = -1;
    let lastFullyVisible = -1;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as HTMLElement;

      const containerRect = container.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();

      const top = rowRect.top - containerRect.top + container.scrollTop;
      const bottom = top + rowRect.height;

      const fullyVisible = top >= viewTop && bottom <= viewBottom;

      if (fullyVisible) {
        if (firstFullyVisible === -1) {
          firstFullyVisible = i;
        }
        lastFullyVisible = i;
      }
    }

    // fallback если нет полностью видимых строк (редкий кейс)
    if (firstFullyVisible === -1) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i] as HTMLElement;
        const top = row.offsetTop;
        const bottom = top + row.offsetHeight;

        if (bottom > viewTop) {
          firstFullyVisible = i;
          break;
        }
      }

      lastFullyVisible = firstFullyVisible;
    }

    return {
      first: firstFullyVisible,
      last: lastFullyVisible,
    };
  };

  scrollToRow = () => {
    const { selectedRow } = this.state;

    if (!this.scrollArea?.current) return;

    const container = this.scrollArea.current;
    const rowsWrapper = container.firstElementChild;
    if (!rowsWrapper) return;

    const rowElement = rowsWrapper.children[selectedRow] as HTMLElement;
    if (!rowElement) return;

    rowElement.scrollIntoView({
      behavior: "smooth",   // можно "auto" если не нужна анимация
      block: "nearest",     // не прыгает резко
    });
  };

  scrollPage = (align: "up" | "down") => {
    const { selectedRow } = this.state;
    const container = this.scrollArea?.current;
    if (!container) return;

    const rowsWrapper = container.firstElementChild;
    if (!rowsWrapper) return;

    const row = rowsWrapper.children[selectedRow] as HTMLElement;
    if (!row) return;

    if (align === "up") {
      container.scrollTop = row.offsetTop;
    } else {
      container.scrollTop = row.offsetTop + row.offsetHeight - container.clientHeight;
    }
  };
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
  renderContextMenu() {
    const { contextMenu } = this.state;
    if (!contextMenu) return null;
    return (
      <div
        className="q2-context-menu"
        style={{
          top: contextMenu.y,
          left: contextMenu.x,
        }}
        onClick={() => this.setState({ contextMenu: undefined })}
        onContextMenu={e => e.preventDefault()}
      >
        <div>
          <div className="q2-context-menu-item">1</div>
          <div className="q2-context-menu-item">2</div>
          <div className="q2-context-menu-item">3</div>
        </div>
      </div>
    );
  }


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
    if (rowIndex === 0) {
      className += " first-row"
    }
    return (
      <div key={rowIndex} className={className}
        onClick={() => this.handleRowClick(rowIndex)}
        onContextMenu={e => this.handleContextMenu(e, rowIndex)}
      >
        {columnOrder.map((colIdx) => {
          const column = columns[colIdx];
          const width = this.resizeColumns ? `${colWidths[colIdx]}px` : "auto";
          return (
            <div
              key={column.column}
              className="Q2DataList-cell"
              style={{
                flex: `1 1 ${width}`,
                width: `${width}px`,
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
          {this.renderContextMenu()}
        </div>
      );
    }
  }
}

export default Q2DataList;
const report_json = `{
  "queries": {
    "header": "select invoice.* , customers.name, customers.address from invoice left join customers on invoice.cid = customers.cid where invoice.id = :id ",
    "lines": "select invoice_lines.* from invoice_lines where parent_id = :id norder by id"
  },
  "params": {
    "id": "1"
  },
  "pages": [
    {
      "columns": [
        {
          "rows": [
            {
              "role": "table",
              "data_source": "header",
              "groupby": "",
              "table_groups": [],
              "print_when": "",
              "print_after": "",
              "new_page_before": "",
              "new_page_after": "",
              "heights": [
                "0-0",
                "0-0",
                "0-0",
                "0-0.30",
                "0-0"
              ],
              "cells": {
                "0,0": {
                  "data": "Invoice number <b>{id}</b><br>{date}",
                  "style": {
                    "text-align": "center",
                    "font-size": "17pt",
                    "border-width": "8 0 1 0",
                    "border-color": "black",
                    "vertical-align": "middle"
                  },
                  "rowspan": 1,
                  "colspan": 5,
                  "format": "D"
                },
                "1,0": {
                  "data": "Customer",
                  "style": {
                    "text-align": "right",
                    "border-color": "black",
                    "padding": "0.05cm 1.0cm 0.05cm 0.05cm"
                  }
                },
                "1,2": {
                  "style": {
                    "text-align": "left",
                    "border-color": "black"
                  }
                },
                "1,1": {
                  "data": "{name}",
                  "style": {
                    "text-align": "left",
                    "font-weight": "bold",
                    "border-color": "black"
                  },
                  "rowspan": 1,
                  "colspan": 4
                },
                "3,0": {
                  "data": "Address",
                  "style": {
                    "border-color": "black",
                    "padding": "0.05cm 0.05cm 0.05cm 1.0cm"
                  }
                },
                "3,4": {
                  "style": {
                    "border-color": "black"
                  }
                },
                "3,2": {
                  "style": {
                    "border-color": "black"
                  }
                },
                "3,1": {
                  "data": "{address}",
                  "style": {
                    "border-color": "black",
                    "text-align": "left"
                  },
                  "rowspan": 1,
                  "colspan": 4
                },
                "3,3": {
                  "style": {
                    "border-color": "black"
                  }
                },
                "2,0": {
                  "style": {
                    "border-color": "black"
                  }
                },
                "4,0": {
                  "style": {
                    "border-color": "black"
                  }
                },
                "2,1": {
                  "style": {
                    "border-color": "black"
                  }
                },
                "2,3": {
                  "style": {
                    "border-color": "black"
                  }
                }
              },
              "style": {
                "text-align": "center",
                "vertical-align": "middle",
                "font-size": "13pt",
                "border-width": "0 0 0 0"
              }
            },
            {
              "role": "table",
              "data_source": "lines",
              "groupby": "",
              "table_groups": [],
              "print_when": "",
              "print_after": "",
              "new_page_before": "",
              "new_page_after": "",
              "heights": [
                "0-0"
              ],
              "cells": {
                "0,2": {
                  "data": "{qt}",
                  "style": {
                    "text-align": "right",
                    "border-color": "black"
                  }
                },
                "0,0": {
                  "data": "{product}",
                  "rowspan": 1,
                  "colspan": 2
                },
                "0,3": {
                  "data": "{price}",
                  "style": {
                    "text-align": "right",
                    "border-color": "black"
                  }
                },
                "0,4": {
                  "style": {
                    "text-align": "right",
                    "border-color": "black"
                  },
                  "data": "{num(qt)*num(price)}"
                }
              },
              "table_header": {
                "role": "table_header",
                "data_source": "",
                "groupby": "",
                "table_groups": [],
                "print_when": "",
                "print_after": "",
                "new_page_before": "",
                "new_page_after": "",
                "heights": [
                  "0-0"
                ],
                "cells": {
                  "0,0": {
                    "data": "Product",
                    "rowspan": 1,
                    "colspan": 2
                  },
                  "0,2": {
                    "data": "Quantity"
                  },
                  "0,3": {
                    "data": "Price"
                  },
                  "0,4": {
                    "data": "Total"
                  }
                },
                "style": {
                  "text-align": "center",
                  "vertical-align": "middle",
                  "font-size": "13pt"
                }
              },
              "table_footer": {
                "role": "table_footer",
                "data_source": "",
                "groupby": "",
                "table_groups": [],
                "print_when": "",
                "print_after": "",
                "new_page_before": "",
                "new_page_after": "",
                "heights": [
                  "0.9-0.9",
                  "0-0"
                ],
                "cells": {
                  "1,0": {
                    "style": {
                      "border-width": "1 0 0 0",
                      "border-color": "black"
                    }
                  },
                  "1,1": {
                    "style": {
                      "border-width": "1 0 0 0",
                      "border-color": "black"
                    }
                  },
                  "1,3": {
                    "style": {
                      "border-width": "0 0 0 0",
                      "font-weight": "bold",
                      "font-size": "11pt",
                      "border-color": "black"
                    }
                  },
                  "1,4": {
                    "style": {
                      "text-align": "right",
                      "font-weight": "bold",
                      "border-color": "black"
                    },
                    "data": "{sum:num(qt)*num(price)}"
                  },
                  "1,2": {
                    "data": "{sum:qt}",
                    "style": {
                      "text-align": "right",
                      "vertical-align": "bottom",
                      "font-weight": "bold",
                      "border-color": "black"
                    }
                  },
                  "0,0": {
                    "rowspan": 1,
                    "colspan": 5,
                    "style": {
                      "font-size": "2pt",
                      "border-width": "1 0 1 0",
                      "border-color": "black"
                    }
                  }
                },
                "style": {
                  "font-size": "10pt"
                }
              }
            },
            {
              "role": "free",
              "data_source": "",
              "groupby": "",
              "table_groups": [],
              "print_when": "",
              "print_after": "",
              "new_page_before": "",
              "new_page_after": "",
              "heights": [
                "0-0"
              ],
              "cells": {}
            }
          ],
          "widths": [
            "30.00%",
            "0.00",
            "3.00",
            "3.00",
            "3.00"
          ]
        }
      ],
      "page_width": 21.0,
      "page_height": 29.0,
      "page_margin_left": 2.0,
      "page_margin_top": 2.0,
      "page_margin_right": 1.0,
      "page_margin_bottom": 2.0
    }
  ],
  "style": {
    "font-family": "Arial",
    "font-size": "8pt",
    "font-weight": "normal",
    "border-width": "1 1 1 1",
    "border-color": "black",
    "padding": "0.05cm 0.05cm 0.05cm 0.05cm",
    "text-align": "left",
    "vertical-align": "top"
  },
  "module": "#"
}`


function get_report_json() {
    return JSON.parse(report_json)
}

export default get_report_json;
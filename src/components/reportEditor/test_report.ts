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
                "1.00-0",
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
                    "text-align": "right",
                    "vertical-align": "top"
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

const report_json1= `{
  "queries": [
    {
      "name": "111",
      "sql": "select * from konto"
    },
    {
      "name": "222",
      "sql": "select 3333\\nunion all\\nselect 3333"
    }
  ],
  "params": {},
  "pages": [
    {
      "page_width": "21.00",
      "page_height": "29.70",
      "page_margin_left": "2.00",
      "page_margin_right": "1.00",
      "page_margin_top": "1.00",
      "page_margin_bottom": "1.00",
      "style": {
        "vertical-align": "top",
        "border-width": "1 1 1 1"
      },
      "columns": [
        {
          "widths": [
            "50%",
            "2",
            "0",
            "4"
          ],
          "style": {
            "vertical-align": "bottom"
          },
          "rows": [
            {
              "style": {
                "background": "#16F1E1",
                "text-align": "right"
              },
              "role": "table",
              "data_source": "cursor",
              "groupby": "",
              "table_page_footer": {},
              "table_groups": [
                {
                  "group_header": {
                    "cells": {
                      "0,0": {
                        "data": "Header grp___{grp}",
                        "style": {
                          "text-align": "left",
                          "font-weight": "bold",
                          "font-size": "26pt",
                          "vertical-align": "middle"
                        },
                        "rowspan": 1,
                        "colspan": 4
                      }
                    },
                    "role": "group_header",
                    "data_source": "",
                    "groupby": "grp",
                    "table_groups": [],
                    "print_when": "",
                    "print_after": "",
                    "new_page_before": "",
                    "new_page_after": "",
                    "heights": [
                      "0-0"
                    ]
                  },
                  "group_footer": {
                    "cells": {
                      "0,0": {
                        "data": "footer GRP",
                        "style": {
                          "text-align": "left",
                          "font-weight": "bold"
                        }
                      },
                      "0,3": {
                        "data": "{sum:num1}",
                        "style": {
                          "text-align": "right"
                        }
                      },
                      "0,2": {
                        "data": "row count:{_row_number}  grp {grp}:"
                      }
                    },
                    "role": "group_footer",
                    "data_source": "",
                    "groupby": "grp",
                    "table_groups": [],
                    "print_when": "",
                    "print_after": "",
                    "new_page_before": "",
                    "new_page_after": "",
                    "heights": [
                      "0-0"
                    ]
                  }
                },
                {
                  "group_header": {
                    "cells": {
                      "0,0": {
                        "data": "Header tom {tom}",
                        "style": {
                          "text-align": "left",
                          "font-weight": "bold"
                        },
                        "rowspan": 1,
                        "colspan": 4
                      }
                    },
                    "role": "group_header",
                    "data_source": "",
                    "groupby": "tom",
                    "table_groups": [],
                    "print_when": "",
                    "print_after": "",
                    "new_page_before": "",
                    "new_page_after": "",
                    "heights": [
                      "0-0"
                    ]
                  },
                  "group_footer": {
                    "cells": {
                      "0,3": {
                        "data": "{sum:num1}",
                        "style": {
                          "text-align": "right"
                        }
                      },
                      "0,2": {
                        "data": "Total tom {tom}",
                        "style": {
                          "text-align": "right"
                        }
                      },
                      "0,0": {
                        "data": "footer TOM",
                        "style": {
                          "font-weight": "bold"
                        }
                      }
                    },
                    "role": "group_footer",
                    "data_source": "",
                    "groupby": "tom",
                    "table_groups": [],
                    "print_when": "",
                    "print_after": "",
                    "new_page_before": "",
                    "new_page_after": "",
                    "heights": [
                      "0-0"
                    ]
                  }
                }
              ],
              "heights": [
                "1.00-0",
                "0-0"
              ],
              "cells": {
                "0,0": {
                  "data": "{grp}",
                  "style": {
                    "font-size": "11pt",
                    "text-align": "center",
                    "vertical-align": "middle",
                    "border-width": "1"
                  }
                },
                "0,1": {
                  "data": "{_row_number} from {_row_count}",
                  "style": {
                    "font-size": "15pt",
                    "text-align": "center"
                  },
                  "rowspan": 1,
                  "colspan": 3
                },
                "1,2": {
                  "data": "{num(num1)+num(100)} <b>{data1}</b>"
                },
                "1,3": {
                  "data": "{num1}"
                },
                "1,0": {
                  "data": "grp:{grp} tom:{tom}"
                }
              },
              "group": [],
              "print_when": "",
              "print_after": "",
              "new_page_before": "",
              "new_page_after": "",
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
                  "2-0"
                ],
                "cells": {
                  "0,0": {
                    "data": "{p1}Header 1"
                  },
                  "0,1": {
                    "data": "Header 2",
                    "style": {
                      "font-size": "9pt"
                    }
                  },
                  "0,2": {
                    "data": "Header 13",
                    "rowspan": 1,
                    "colspan": 2
                  }
                },
                "style": {
                  "border-width": "2 2 2 2",
                  "text-align": "center",
                  "vertical-align": "middle"
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
                  "0-0"
                ],
                "cells": {
                  "0,0": {
                    "data": "table footer:"
                  },
                  "0,3": {
                    "data": "Text {sum:num1} total",
                    "style": {
                      "font-weight": "bold"
                    }
                  },
                  "0,1": {
                    "data": "{sum:num1} ",
                    "style": {
                      "font-weight": "bold"
                    }
                  }
                },
                "style": {
                  "text-align": "right"
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
              "cells": {
                "0,0": {
                  "data": "333ggggggggggg",
                  "style": {
                    "vertical-align": "middle"
                  }
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
              "cells": {
                "0,0": {
                  "data": "QQQQQQQ{p1}QQQQQQQQ",
                  "style": {
                    "vertical-align": "middle",
                    "text-align": "right"
                  },
                  "rowspan": 1,
                  "colspan": 4
                }
              }
            }
          ]
        }
      ]
    }
  ],
  "style": {
    "font-family": "Arial",
    "font-size": "10pt",
    "font-weight": "normal",
    "border-width": "0 0 0 0",
    "padding": "0.05cm 0.05cm 0.05cm 0.05cm",
    "text-align": "left",
    "vertical-align": "top"
  }
}`


const data_sets_json = `{
  "params": {
    ":id": "1"
  },
  "header": [
    {
      "id": "1",
      "date": "2022-06-12",
      "cid": "2",
      "q2_time": "20240424142243",
      "q2_mode": "u",
      "comment": "Free delivery",
      "name": "Customer 1",
      "address": "125 New Street Newcity"
    }
  ],
  "lines": [
    {
      "id": "0",
      "parent_id": "1",
      "price": "45",
      "qt": "2",
      "product": "Product 1",
      "q2_time": "20240424143641",
      "q2_mode": "u",
      "pid": "2",
      "comment": ""
    },
    {
      "id": "1",
      "parent_id": "1",
      "price": "3",
      "qt": "5",
      "product": "Product 2",
      "q2_time": "20240424143645",
      "q2_mode": "u",
      "pid": "1",
      "comment": ""
    }
  ]
}`


const data_sets_json1 = `{
        "cursor": [
            {"data1": "XyDlguzuz", "num1": "5", "grp": 0, "tom": 1},
            {"data1": "XInjlysVB", "num1": "4", "grp": 0, "tom": 1},
            {"data1": "rUKcWIPkl", "num1": "6", "grp": 0, "tom": 2},
            {"data1": "fOBgKlaHr", "num1": "4", "grp": 0, "tom": 2},
            {"data1": "KBmHYMYQs", "num1": "9", "grp": 0, "tom": 3},
            {"data1": "FHuLGxKIe", "num1": "3", "grp": 0, "tom": 3},
            {"data1": "wGDrDFdmd", "num1": "3", "grp": 1, "tom": 1},
            {"data1": "jEHyRbKGx", "num1": "7", "grp": 1, "tom": 1},
            {"data1": "neLrvZQRP", "num1": "5", "grp": 1, "tom": 2},
            {"data1": "BXPKaXFSa", "num1": "9", "grp": 1, "tom": 2}
        ]
    }`

export function get_report_json() {
  return JSON.parse(report_json)
}

export function get_data_sets_json() {
  return JSON.parse(data_sets_json)
}

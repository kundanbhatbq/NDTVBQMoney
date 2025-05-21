export const openInterestColumns = [
  {
    field: "name",
    headerName: "Name",
    width: 140,
    hideable: false,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "date",
    headerName: "Date",
    width: 140,
    hideable: false,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "percent",
    headerName: "Percent",
    width: 140,
    headerClassName: "super-app-theme--header",
    renderCell: (params) => (
      <div style={{ color: params.value < 0 ? "red" : "green" }}>
        {params.value}
      </div>
    ),
  },
  {
    field: "firstMFuture",
    headerName: "1st M Future",
    width: 140,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "secondMFuture",
    headerName: "2nd M Future",
    width: 140,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "basis",
    headerName: "Basis",
    width: 140,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "mwpl",
    headerName: "MWPL",
    width: 140,
    headerClassName: "super-app-theme--header",
    renderCell: (params) => {
      let color = "black"; // Default color
      if (params.value > 95) {
        color = "red"; // Above 95%
      } else if (params.value >= 80 && params.value <= 95) {
        color = "blue"; // Between 80% and 95%
      }
      return (
        <div style={{ color }}>
          {params.value}
        </div>
      );
    },
  },
  {
    field: "openInterest",
    headerName: "1M OI",
    width: 140,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "changeOpenInterest",
    headerName: "1M Change OI",
    width: 140,
    headerClassName: "super-app-theme--header",
    renderCell: (params) => (
      <div style={{ color: params.value < 0 ? "red" : "green" }}>
        {params.value}
      </div>
    ),
  },
  {
    field: "prevOpenInterest",
    headerName: "1M Prev OI",
    width: 140,
    headerClassName: "super-app-theme--header",
  },
  
  {
    field: "oiValue",
    headerName: "OI Value",
    width: 140,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "changeOiValue",
    headerName: "Change OI Value",
    width: 140,
    headerClassName: "super-app-theme--header",
    renderCell: (params) => (
      <div style={{ color: params.value < 0 ? "red" : "green" }}>
        {params.value}
      </div>
    ),
  },
  {
    field: "prevOiValue",
    headerName: "Prev OI Value",
    width: 140,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "rolloverSpread",
    headerName: "Rollover Spread",
    width: 140,
    headerClassName: "super-app-theme--header",
    renderCell: (params) => (
      <div style={{ color: params.value < 0 ? "red" : "green" }}>
        {params.value}
      </div>
    ),
  },
  {
    field: "rolloverPercent",
    headerName: "Rollover Percent",
    width: 140,
    headerClassName: "super-app-theme--header",
  },

  {
    field: "volume",
    headerName: "Volume",
    width: 140,
    headerClassName: "super-app-theme--header",
  },

  {
    field: "industryName",
    headerName: "Industry Name",
    width: 140,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "basicIndustryName",
    headerName: "Basic Industry Name",
    width: 140,
    headerClassName: "super-app-theme--header",
  }
  

  
];

export const openCPColumns = [
  {
    field: "callBreakEven",
    headerName: "BreakEven",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "callPremiumTurnover",
    headerName: "PremiumTO",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "callNotionalTurnover",
    headerName: "NotionalTO",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "callOiTurnover",
    headerName: "OiTurnover",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "callOiPercChange",
    headerName: "OiPerC",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "callOiChange",
    headerName: "OiChg",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "callOi",
    headerName: "Oi",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "callVol",
    headerName: "Vol",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "callSpotPrice",
    headerName: "SpotP",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "callPremium",
    headerName: "Premium",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "exchangeSymbol",
    headerName: "Symbol",
    cellClassName: "super-app-theme--cell",
    width: 140,
    hideable: false,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "expiryDate",
    headerName: "ExpiryD",
    cellClassName: "super-app-theme--cell",
    width: 100,
    hideable: false,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "strikePrice",
    headerName: "Strike",
    width: 85,
    cellClassName: "super-Strike-theme--cell",
    hideable: false,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "volPcr",
    headerName: "volPcr",
    width: 85,
    cellClassName: "super-app-theme--cell",
    headerClassName: "super-app-theme--header",
  },
  {
    field: "oiPcr",
    headerName: "oiPcr",
    width: 85,
    cellClassName: "super-app-theme--cell",
    headerClassName: "super-app-theme--header",
    renderCell: (params) => <div>{params.value}</div>,
  },
  {
    field: "underlyingValue",
    headerName: "underlyingV",
    width: 85,
    cellClassName: "super-app-theme--cell",
    headerClassName: "super-app-theme--header",
  },
  {
    field: "putPremium",
    headerName: "Premium",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "putSpotPrice",
    headerName: "SpotP",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "putVol",
    headerName: "Vol",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "putOi",
    headerName: "Oi",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "putOiChange",
    headerName: "OiChg",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "putOiPercChange",
    headerName: "OiPerC",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "putOiTurnover",
    headerName: "OiTurnover",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "putNotionalTurnover",
    headerName: "NotionalTO",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "putPremiumTurnover",
    headerName: "PremiumTO",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "putBreakEven",
    headerName: "BreakEven",
    width: 85,
    headerClassName: "super-app-theme--header",
  },
];


// Define columns
export const OISinceExpiry = [
  {
    field: "security",
    headerName: "SECURITY",
    width: 120,
    hideable: false,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "futuresOI",
    headerName: "OPEN INTEREST (IN CONTRACTS)",
    width: 180,
    headerClassName: "super-app-theme--header",
    type: 'number',
    valueFormatter: (params) => params.value?.toLocaleString(),
  },
  {
    field: "futuresOIChange",
    headerName: "OI % CHANGE",
    width: 160,
    headerClassName: "super-app-theme--header",
    type: 'number',
    renderCell: (params) => (
      <div className={`font-medium ${params.value < 0 ? 'text-red-500' : 'text-green-500'}`}>
        {params.value > 0 ? '+' : ''}{params.value?.toFixed(2)}%
      </div>
    ),
  },
  {
    field: "callsOI",
    headerName: "OPEN INTEREST (IN CONTRACTS)",
    width: 180,
    headerClassName: "super-app-theme--header",
    type: 'number',
    valueFormatter: (params) => params.value?.toLocaleString(),
  },
  {
    field: "callsOIChange",
    headerName: "OI % CHANGE",
    width: 160,
    headerClassName: "super-app-theme--header",
    type: 'number',
    renderCell: (params) => (
      <div className={`font-medium ${params.value < 0 ? 'text-red-500' : 'text-green-500'}`}>
        {params.value > 0 ? '+' : ''}{params.value?.toFixed(2)}%
      </div>
    ),
  },
  {
    field: "putsOI",
    headerName: "OPEN INTEREST (IN CONTRACTS)",
    width: 180,
    headerClassName: "super-app-theme--header",
    type: 'number',
    valueFormatter: (params) => params.value?.toLocaleString(),
  },
  {
    field: "putsOIChange",
    headerName: "OI % CHANGE",
    width: 160,
    headerClassName: "super-app-theme--header",
    type: 'number',
    renderCell: (params) => (
      <div className={`font-medium ${params.value < 0 ? 'text-red-500' : 'text-green-500'}`}>
        {params.value > 0 ? '+' : ''}{params.value?.toFixed(2)}%
      </div>
    ),
  },
  {
    field: "totalOI",
    headerName: "OPEN INTEREST (IN CONTRACTS)",
    width: 180,
    headerClassName: "super-app-theme--header",
    type: 'number',
    valueFormatter: (params) => params.value?.toLocaleString(),
  },
  {
    field: "totalOIChange",
    headerName: "OI % CHANGE",
    width: 160,
    headerClassName: "super-app-theme--header",
    type: 'number',
    renderCell: (params) => (
      <div className={`font-medium ${params.value < 0 ? 'text-red-500' : 'text-green-500'}`}>
        {params.value > 0 ? '+' : ''}{params.value?.toFixed(2)}%
      </div>
    ),
  },
  {
    field: "oneMonthOI",
    headerName: "1 MONTH OI(%)",
    width: 150,
    headerClassName: "super-app-theme--header",
    type: 'number',
    valueFormatter: (params) => `${params.value?.toFixed(2)}%`,
  },
  {
    field: "rollover",
    headerName: "ROLLOVER (%)",
    width: 150,
    headerClassName: "super-app-theme--header",
    type: 'number',
    valueFormatter: (params) => `${params.value?.toFixed(2)}%`,
  }
];

// Column grouping configuration
export const columnGroupingModel = [
  {
    groupId: 'futures',
    headerName: 'Futures',
    children: [
      { field: 'futuresOI' },
      { field: 'futuresOIChange' }
    ],
  },
  {
    groupId: 'calls',
    headerName: 'Calls',
    children: [
      { field: 'callsOI' },
      { field: 'callsOIChange' }
    ],
  },
  {
    groupId: 'puts',
    headerName: 'Puts',
    children: [
      { field: 'putsOI' },
      { field: 'putsOIChange' }
    ],
  },
  {
    groupId: 'total',
    headerName: 'Total',
    children: [
      { field: 'totalOI' },
      { field: 'totalOIChange' }
    ],
  }
];
  
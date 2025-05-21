export const openDeliveryColumns = [
  {
    field: "name",
    headerName: "NAME",
    hideable: false,
    type: 'string',
    flex: 1,
    headerClassName: "super-app-theme--header",
    minWidth:150,
     className:"name"
     
  },
  {
    field: "lastPrice",
    headerName: "Last Price",
    hideable: false,
    type: 'number',
    flex: 1,
    headerClassName: "super-app-theme--header",
    minWidth:150
  },
  {
    field: "percentChange",
    headerName: "PercentChange",
    hideable: false,
    type: 'string',
    flex: 1,
    headerClassName: "super-app-theme--header",
    minWidth:150,
     valueFormatter: (params) => {
                return `${params.value?.toFixed(2)}`;
            }
  },
  {
    field: "totalAccVol",
    headerName: "Total Volume",
    flex: 1,
    type: 'number',
    headerClassName: "super-app-theme--header",
    minWidth:150
  },
  {
    field: "totalDelVol",
    headerName: "Delivery Vol",
    flex: 1,
    type: 'number',
    headerClassName: "super-app-theme--header",
    minWidth:150
  },
  {
    field: "deliveryPerc",
    headerName: "Delivery %",
    flex: 1,
    type: 'number',
    headerClassName: "super-app-theme--header",
    minWidth:150
  },
  {
    field: "totalAccTrnOvr",
    headerName: "Volume Trn Over (₹ Cr)",
    flex: 1,
    type: 'number',
    headerClassName: "super-app-theme--header",
    minWidth:150
  },
  {
    field: "totalDelTrnOvr",
    headerName: "Delivery Trn Over (₹ Cr)",
    flex: 1,
    type: 'number',
    headerClassName: "super-app-theme--header",
    minWidth:150
  },
  {
    field: "delStOtsd",
    headerName: "Del As % O/shares",
    flex: 1,
    type: "number",
    headerClassName: "super-app-theme--header",
    minWidth: 150,
    valueGetter: (params) => {
      const totalDelVol = params.row.totalDelVol || 0; // Ensure it's a valid number
      const shareOutstanding = params.row.shareOutstanding || 1; // Avoid division by zero
      return (totalDelVol / shareOutstanding) * 100;
    },
    valueFormatter: (params) => `${params.value?.toFixed(2)}%`, // Format the value to 2 decimal places
  }
  ,
  {
    field: "avgDelVolume",
    headerName: "Average30DeliVolume",
    flex: 1,
    type: 'number',
    headerClassName: "super-app-theme--header",
    minWidth:150
  },
  {
    field: "avgVolume",
    headerName: "Average30Volume",
    flex: 1,
    type: 'number',
    headerClassName: "super-app-theme--header",
    minWidth:150
  },
  {
    field: "x30DAVol",
    headerName: "x-30-DA-Volume",
    flex: 1,
    type: 'number',
    headerClassName: "super-app-theme--header",
    minWidth:150
  },
  {
    field: "x30DADel",
    headerName: "x-30-DA-Delivery",
    flex: 1,
    type: 'number',
    headerClassName: "super-app-theme--header",
    minWidth:150
  },
  ,
  {
    field: "marketCapCr",
    headerName: "Mkt Cap (Cr)",
    flex: 1,
    type: 'number',
    headerClassName: "super-app-theme--header",
    minWidth:150
 
  },
]
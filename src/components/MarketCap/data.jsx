export const Columns = [
    {
      field: 'isin',
      headerName: 'ISIN',
      flex: 1,
    },
    {
      field: 'exchange_symbol',
      headerName: 'Exchange Symbol',
      flex: 1,
    },
    {
      field: 'name',
      headerName: 'Company Name',
      flex: 1,
    },
    {
      field: 'currentMarketCap',
      headerName: 'Current Market Cap',
      flex: 1,
      type: 'number',
      valueFormatter: (params) => 
        params.value 
          ? (params.value / 10000000).toLocaleString('en-IN', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            }) + ' CR'
          : '0.00 CR',
    },
    {
        field: 'previousMarketCap',
        headerName: 'Previous Market Cap',
        flex: 1,
        type: 'number',
        valueFormatter: (params) => 
          params.value 
            ? (params.value / 10000000).toLocaleString('en-IN', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              }) + ' CR'
            : '0.00 CR',
      },
      {
        field: 'marketCapChange',
        headerName: 'Market Cap Change ',
        flex: 1,
        type: 'number',
        valueGetter: (params) => {
          const current = params.row.currentMarketCap || 0;
          const previous = params.row.previousMarketCap || 0;
          return current - previous;
        },
        cellClassName: (params) => 
          params.value > 0 ? 'text-green-500' : 
          params.value < 0 ? 'text-red-500' : 
          '',
        valueFormatter: (params) =>
          params.value
            ? (params.value / 10000000).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) + ' CR'
            : '0.00 CR',
      },
  
    {
      field: 'basicindustry',
      headerName: 'Basic Industry',
      flex: 1,
    },
    {
      field: 'industry',
      headerName: 'Industry',
      flex: 1,
    },
    {
      field: 'avg_6month_marketcap',
      headerName: 'Avg 6-Month Market Cap',
      flex: 1,
      type: 'number',
      valueFormatter: (params) => 
        params.value 
          ? (params.value / 10000000).toLocaleString('en-IN', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            }) + ' CR'
          : '0.00 CR',
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
    }
  ];
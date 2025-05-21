import axios from "axios";

const apiConfigUrl = "http://ndtvmoney.ndtvprofit.com:8092/bqmoney"

export const apiConfig = async (value, userToken) => {
  try {
    const response = await axios.get(
      `${apiConfigUrl}/stocks/${value}`,
      userToken
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};


export const apiConfigTicker = async (value, userToken) => {
  try {
    const response = await axios.get(
      `${apiConfigUrl}/${value}`,
      userToken
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
export const apiConfigCalendar = async (value, userToken) => {
  try {
    const response = await axios.get(
      `${apiConfigUrl}/${value}`,
      userToken
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const apiConfigNewsFlash = async (value, userToken) => {
  try {
    const response = await axios.get(
      `${apiConfigUrl}/${value}`,
      userToken
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// export const apiConfigNewsFlash = async (value, userToken) => {
//   try {
//     const response = await axios.delete(
//       `${apiConfigUrl}/stocks/${value}`,
//       userToken
//     );
//     return response.data;
//   } catch (err) {
//     console.error(err);
//     throw err;
//   }
// };

export const apiConfigPost = async (value, payload, userToken) => {
  try {
    const response = await axios.post(
      `${apiConfigUrl}/${value}`,
      payload,
      userToken
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const apiConfigPostChange = async (value, payload, userToken) => {
  try {
    const response = await axios.post(
      `${apiConfigUrl}/stocks/${value}`,
      payload,
      userToken
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const graphConfig = async (value, userToken) => {
  try {
    const response = await axios.get(
      `${apiConfigUrl}/graph/${value}`,
      userToken
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const ws = {
  socketUrl: "ws://ndtvmoney.ndtvprofit.com:15674/ws",
  exchangeHeaderUrl: "/exchange/nse_bse_header_indices/#",
  exchangeTableUrl: "/exchange/nse_bse_json/#",
  // exchangeHeaderUrl: "/exchange/nse_bse_json/#",
};

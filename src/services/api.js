import axios from "axios";

class Api {
  getResource = async (url, body, method, headers = {}, data) => {
    let response = null;
    response = await axios({
      url: `api/${url}`,
      method: method,
      data: body,
      params: data,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    return response.data;
  };
  startParse = async (data) => {
    let url = "startParse";
    const response = await this.getResource(url, data, "POST", null, null);
    return response;
  };
  stopParse = async () => {
    let url = "stopParse";
    const response = await this.getResource(url, {}, "POST", null, null);
    return response;
  };
  getLastTimeUpdate = async () => {
    let url = "getLastTimeUpdate";
    const response = await this.getResource(url, {}, "GET", null, null);
    return response;
  };
}
export default new Api();

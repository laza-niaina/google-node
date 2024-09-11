const axios = require("axios");

class Requests {
  constructor() {
    this.session = axios.create();
    this.session.defaults.headers.common["Host"] = "www.google.com";
    this.session.defaults.headers.common["User-Agent"] =
      "Mozilla/5.0 (X11; Linux x86_64; rv:98.0) Gecko/20100101 Firefox/98.0";
    this.session.defaults.headers.common["Accept"] = "*/*";
    this.session.defaults.headers.common["Referer"] = "https://www.google.com/";
  }

  async get(url, options) {
    try {
      const response = await this.session.get(url, this._mergeHeaders(options));
      return response;
    } catch (error) {
      throw error;
    }
  }

  async post(url, data, options) {
    try {
      const response = await this.session.post(
        url,
        data,
        this._mergeHeaders(options)
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  _mergeHeaders(options) {
    const headers = Object.assign(
      {},
      this.session.defaults.headers.common,
      options.headers || {}
    );
    return { ...options, headers };
  }
}

module.exports = { Requests };

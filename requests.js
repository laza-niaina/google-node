const axios = require('axios');

class Requests {
  constructor() {
    this.session = axios.create({
      headers: {
        'Host': 'www.google.com',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:98.0) Gecko/20100101 Firefox/98.0',
        'Accept': '*/*',
        'Referer': 'https://www.google.com/'
      }
    });
  }

  async get(url, options) {
    try {
      const response = await this.session.get(url, options);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async post(url, data, options) {
    try {
      const response = await this.session.post(url, data, options);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Requests;

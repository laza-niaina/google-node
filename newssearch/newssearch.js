const { parseHtmlResult } = require('./parser');
const { Requests } = require('../requests');
const { LANGUAGES } = require('../constants');
const { GoogleSearch } = require('../googlesearch');

class NewsSearch extends GoogleSearch {
  constructor(query, limit = 10, page = 1, lang = 'fr', region = 'fr', safeSearch = false) {
    super(query, lang, region, safeSearch);

    this._session.headers['Accept-Language'] = `${LANGUAGES.get(this.lang)},${this.lang};q=0.5`;

    this.limit = limit;
    this.page = page;
    this.results = {
      page: 1,
      end: false,
      results: null,
    };

    this.__getResults();
  }

  nextResults() {
    if (!this.results.end) {
      this.page += 1;
      const nextResults = this.__getResults();

      if (nextResults.length === 0) {
        console.log('End of results.');
        this.page -= 1;
      } else {
        this.results.results = nextResults;
      }
    } else {
      console.log('End of results');
    }
  }

  __getResults() {
    const htmlResult = this.__fetchHtmlResult();

    const parsedResults = parseHtmlResult(htmlResult);

    if (parsedResults.length === 0) {
      this.results.end = true;
    }

    this.results.results = parsedResults;
  }

  __fetchHtmlResult() {
    const requestBody = {
      q: this.query,
      num: this.limit,
      hl: this.lang,
      tbm: 'nws',
      sclient: 'gws-wiz-news',
    };

    if (this.page > 1) {
      requestBody.start = (this.page * 10) - 10;
    }

    const response = this.get(this.url, { params: requestBody, allowRedirects: true });

    if (response.statusCode !== 200) {
      throw new Error(`Failed to fetch HTML results. ${response.statusCode} ${response.statusMessage}`);
    }

    return response.body;
  }
}

module.exports = NewsSearch;

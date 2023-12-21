const { parseJsData, parseJsonData, parseChipsData, parseTbsData, parseResultsData, parseNextPageData, checkSafeSearchBlock } = require('./parser');
const { GoogleSearch, Requests } = require('googlesearchpython');

class ImageSearch extends GoogleSearch {
  constructor(query, lang = 'fr', region = 'fr', safeSearch = false) {
    super(query, lang, region, safeSearch);

    this.__searchMethod = 'isch';
    this.session.defaults.headers.common['Accept-Language'] = `${this.languages[this.lang]},${this.lang};q=0.5`;

    this.status = { message: null };
    this.chips = { chips: null };
    this.tbs = { tbs: null };
    this.results = { page: 1, end: false, results: null };
    this.__nextPageData = null;

    this.__getFirstResults();
  }

  nextResults() {
    if (!this.results.end) {
      const url = 'https://www.google.com/_/VisualFrontendUi/data/batchexecute';

      const requestBody = { hl: this.lang };
      const data = this.__nextPageData;
      const response = this.post(url, { params: requestBody, data });

      try {
        const { results, next_page_data } = parseJsonData(response.data);
        this.results.results = parseResultsData(results);
        this.results.page += 1;

        try {
          this.__nextPageData = parseNextPageData(this.query, next_page_data);
        } catch (error) {
          console.log('End of results.');
          this.results.end = true;
        }
      } catch (error) {
        console.log('End of results.');
        this.results.end = true;
      }
    } else {
      console.log('End of results.');
    }
  }

  nextPageData() {
    return this.__nextPageData;
  }

  __getFirstResults() {
    const htmlResult = this.__fetchHtmlResult();

    let safeSearchBlock = null;
    if (this.safeSearch) {
      safeSearchBlock = checkSafeSearchBlock(htmlResult);
    }

    if (safeSearchBlock !== null) {
      this.status.message = safeSearchBlock;
      this.chips.chips = [];
      this.tbs.tbs = [];
      this.results.end = true;
      this.results.results = [];
    } else {
      const [chipsData, tbsData, resultsData, nextPageData] = parseJsData(htmlResult);

      this.status.message = 'ok';
      this.chips.chips = chipsData === null ? null : parseChipsData(chipsData);
      this.tbs.tbs = tbsData === null ? null : parseTbsData(tbsData);
      this.results.results = parseResultsData(resultsData);

      try {
        this.__nextPageData = parseNextPageData(this.query, nextPageData);
      } catch (error) {
        this.results.end = true;
      }
    }
  }

  __fetchHtmlResult() {
    const requestBody = {
      q: this.query,
      tbm: this.__searchMethod,
      oq: this.query,
      safe: this.safeSearch ? 'on' : 'off',
      sclient: 'img',
      bih: 292,
      biw: 1366,
      client: 'firefox-b-d',
    };

    const response = this.get(this.url, { params: requestBody, allowRedirects: true });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch HTML results. ${response.status} ${response.statusText}`);
    }

    return response.data;
  }
}

module.exports = ImageSearch;

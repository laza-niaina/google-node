const { parseHtmlResult } = require("./parser");
const { Requests } = require("../requests");
const { LANGUAGES } = require("../constants");
const { GoogleSearch } = require("../googlesearch");
const req = new Requests();
class NewsSearch extends GoogleSearch {
  constructor(
    query,
    limit = 10,
    page = 1,
    lang = "fr",
    region = "fr",
    safeSearch = false,
  ) {
    super(query, lang, region, safeSearch);

    req.session.defaults.headers.common["Accept-Language"] = `${
      LANGUAGES[this.lang]
    },${this.lang};q=0.5`;

    this.limit = limit;
    this.page = page;
    this.results = {
      page: 1,
      end: false,
      results: null,
    };

    this.getResults();
  }

  nextResults() {
    if (!this.results.end) {
      this.page += 1;
      const nextResults = this.__getResults();

      if (nextResults.length === 0) {
        console.log("End of results.");
        this.page -= 1;
      } else {
        this.results.results = nextResults;
      }
    } else {
      console.log("End of results");
    }
  }

  async getResults() {
    const htmlResult = await this.fetchHtmlResult();

   const parsedResults = parseHtmlResult(htmlResult);

    if (parsedResults.length === 0) {
      this.results.end = true;
    }

    this.results.results = parsedResults;
		return parsedResults;
  }

  async fetchHtmlResult() {
    const requestBody = {
      q: this.query,
      num: this.limit,
      hl: this.lang,
      tbm: "nws",
      sclient: "gws-wiz-news",
    };

    if (this.page > 1) {
      requestBody.start = this.page * 10 - 10;
    }

    const response = await req.get(this.url, {
      params: requestBody,
      allowRedirects: true,
    });

    if (response.status !== 200) {
      throw new Error(
        `Failed to fetch HTML results. ${response.status} ${response.statusText}`,
      );
    }
    return response.data;
  }
}

module.exports = { NewsSearch };

const cheerio = require("cheerio");
const { parseHtmlResult } = require("./parser");
const { Requests } = require("../requests");
const { LANGUAGES } = require("../constants");
const { extractHtmlBlock } = require("../utils");
class PageSearch extends Requests {
  constructor(
    query,
    limit = 10,
    page = 1,
    lang = "fr",
    region = "fr",
    safeSearch = false,
  ) {
    super();

    this.url = "https://www.google.com/search";
    this.query = query;
    this.lang = lang;
    this.region = region;
    this.safeSearch = safeSearch;
    this.limit = limit;
    this.page = page;
    this.results = {
      page: page,
      end: false,
      relevantResult: null,
      relatedQuestions: null,
      results: null,
    };

    this.session.headers = {
      "Accept-Language": `${LANGUAGES[this.lang]},${this.lang};q=0.5`,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0",
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      Referer: "https://www.google.com/",
      Connection: "keep-alive",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      TE: "trailers",
    };

    this.getResults();
  }

  async nextResults() {
    if (!this.results.end) {
      this.page += 1;
      const nextResults = await this.getResults();

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
    const htmlResult = await this.__fetchRawResult();
    const cleanedHtmlResult = extractHtmlBlock(htmlResult);
    console.log(parseHtmlResult(cleanedHtmlResult));

    const { relevantResult, relatedQuestions, results } =
      parseHtmlResult(cleanedHtmlResult);

    if (results.length === 0) {
      this.results.end = true;
    }

    if (this.page === 1) {
      this.results.relevantResult = relevantResult;
      this.results.relatedQuestions = relatedQuestions;
    }
    this.results.results = results;
    return results;
  }

  async __fetchRawResult() {
    const requestBody = {
      q: this.query,
      hl: this.lang,
      safe: this.safeSearch ? "on" : "off",
      client: "firefox-b-d",
      sa: "N",
      asearch: "arc",
      cs: "1",
      async:
        "arc_id:srp_110,ffilt:all,ve_name:MoreResultsContainer,use_ac:false,inf:1,_id:arc-srp_110,_pms:s,_fmt:pc",
    };

    if (this.page > 1) {
      requestBody.start = this.page * 10 - 10;
    }

    const response = await this.get(this.url, {
      params: requestBody,
      allowRedirects: true,
    });

    if (response.status !== 200) {
      throw new Error(
        `Failed to fetch raw results. ${response.status} ${response.error}`,
      );
    }

    return response.data;
  }
}
module.exports = { PageSearch };

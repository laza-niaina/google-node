const axios = require("axios");
const { parseHtmlResult } = require("./parser");
const { Requests } = require("../requests");
const { LANGUAGES } = require("../constants");
const { extractHtmlBlock } = require("../utils");
const { GoogleSearch } = require("../googlesearch");
class FileSearch extends GoogleSearch {
  constructor(
    query,
    filetype,
    limit = 10,
    page = 1,
    lang = "fr",
    region = "fr",
    safeSearch = false,
  ) {
    super(query, lang, region, safeSearch);

    this.session.defaults.headers.common["Accept-Language"] =
      `${LANGUAGES[lang]},${lang};q=0.5`;
    this.session.defaults.headers.common["User-Agent"] =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0";
    this.session.defaults.headers.common["Accept"] = "*/*";
    this.session.defaults.headers.common["Accept-Encoding"] =
      "gzip, deflate, br";
    this.session.defaults.headers.common["Referer"] = "https://www.google.com/";
    this.session.defaults.headers.common["Connection"] = "keep-alive";
    this.session.defaults.headers.common["Sec-Fetch-Dest"] = "empty";
    this.session.defaults.headers.common["Sec-Fetch-Mode"] = "cors";
    this.session.defaults.headers.common["Sec-Fetch-Site"] = "same-origin";
    this.session.defaults.headers.common["TE"] = "trailers";

    this.filetype = filetype;
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
        console.log("End of results.");
        this.page -= 1;
      } else {
        this.results.results = nextResults;
      }
    } else {
      console.log("End of results");
    }
  }

  __getResults() {
    const htmlResult = this.__fetchRawResult();
    const cleanedHtmlResult = extractHtmlBlock(htmlResult);
    const parsedResults = parseHtmlResult(cleanedHtmlResult);

    if (parsedResults.length === 0) {
      this.results.end = true;
    }

    this.results.results = parsedResults;
  }

  __fetchRawResult() {
    const requestBody = {
      q: `${this.query} filetype:${this.filetype}`,
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

    return this.get(this.url, {
      params: requestBody,
      allowRedirects: true,
    }).then((response) => {
      if (response.status !== 200) {
        throw new Error(
          `Failed to fetch raw results. ${response.status} ${response.statusText}`,
        );
      }
      return response.data;
    });
  }
}

module.exports = { FileSearch };

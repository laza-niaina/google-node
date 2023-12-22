const axios = require("axios");
const { parseHtmlResult } = require("./parser");
const { Requests } = require("../requests");
const { LANGUAGES } = require("../constants");
const { extractHtmlBlock } = require("../utils");
const { GoogleSearch } = require("../googlesearch");
const req= new Requests()
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

    req.session.defaults.headers.common["Accept-Language"] =
      `${LANGUAGES[lang]},${lang};q=0.5`;
    req.session.defaults.headers.common["User-Agent"] =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0";
    req.session.defaults.headers.common["Accept"] = "*/*";
    req.session.defaults.headers.common["Accept-Encoding"] =
      "gzip, deflate, br";
    req.session.defaults.headers.common["Referer"] = "https://www.google.com/";
    req.session.defaults.headers.common["Connection"] = "keep-alive";
    req.session.defaults.headers.common["Sec-Fetch-Dest"] = "empty";
    req.session.defaults.headers.common["Sec-Fetch-Mode"] = "cors";
    req.session.defaults.headers.common["Sec-Fetch-Site"] = "same-origin";
    req.session.defaults.headers.common["TE"] = "trailers";

    this.filetype = filetype;
    this.limit = limit;
    this.page = page;
    this.results = {
      page: 1,
      end: false,
      results: null,
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
	
    const htmlResult = await this.fetchRawResult();
    const cleanedHtmlResult = extractHtmlBlock(htmlResult);
    const parsedResults = parseHtmlResult(cleanedHtmlResult);

    if (parsedResults.length === 0) {
      this.results.end = true;
    }

    this.results.results = parsedResults;
		return parsedResults;
  }

   async fetchRawResult() {
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

    return req.get(this.url, {
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

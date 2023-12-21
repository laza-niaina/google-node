class GoogleSearch {
  constructor(query, lang, region, safeSearch) {
    this.url = "https://www.google.com/search";
    this.query = query;
    this.lang = lang;
    this.region = region;
    this.safeSearch = safeSearch;
  }
}

module.exports = { GoogleSearch };

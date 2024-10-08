const cheerio = require("cheerio");
const logger = require("../logger");
const{ normalizeUnicodeText }  = require('normalize-unicode-text');
function parseHtmlResult(htmlResult) {
  const results = [];
  try {
    
    const $ = cheerio.load(htmlResult);
    const resultBlocks = $("div.N54PNb");

   if (resultBlocks.length !== 0) {
      resultBlocks.each((index, resultBlock) => {
        try {
    
          const title = $(resultBlock).find("div.yuRUbf h3").text();
          const url = $(resultBlock).find("a").eq(0).attr("href");
          const description = normalizeUnicodeText($(resultBlock).find("div.VwiC3b.yXK7lf").text()).replace(/[~§]/g, '');
          
          results.push({ title, url, description });
        } catch (error) {
          logger.error(error.stack);
        }
      });
    }
  } catch (error) {
    logger.error(error.stack);
  }
  return results;
}

module.exports = { parseHtmlResult };

const cheerio = require('cheerio');

function parseHtmlResult(htmlResult) {
  const $ = cheerio.load(htmlResult);

  const results = [];
  const resultsBlocks = $('#rso');
  if (resultsBlocks.length > 0) {
    const resultBlocks = resultsBlocks.find('.SoaBEf');
    if (resultBlocks.length > 0) {
      resultBlocks.each((index, resultBlock) => {
        try {
          const title = $(resultBlock).find('.n0jPhd.ynAwRc.MBeuO.nDgy9d').text();
          const url = $(resultBlock).find('a.WlydOe').attr('href');
          const published = $(resultBlock).find('.OSrXXb.rbYSKb.LfVVr').text();
          const description = $(resultBlock).find('.GI74Re.nDgy9d').text();

          const result = {
            title,
            url,
            published,
            description,
          };

          results.push(result);
        } catch (error) {
          console.error(error);
        }
      });
    }
  }

  return results;
}

module.exports = {
  parseHtmlResult,
};

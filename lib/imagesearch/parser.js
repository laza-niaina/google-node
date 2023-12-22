const cheerio = require('cheerio');

function parseJsData(htmlContent) {
  const $ = cheerio.load(htmlContent);
  const nonceValue = $('script[data-id="_gd"]').attr('nonce');
  const nonceScripts = $(`script[nonce="${nonceValue}"]`);

  let rawDataScript;
  nonceScripts.each((index, script) => {
    if ($(script).text().includes('AF_initDataCallback(')) {
      rawDataScript = $(script).text();
    }
  });

  rawDataScript = rawDataScript.replace('AF_initDataCallback(', '').replace(');', '');
  rawDataScript = rawDataScript.replace('key: \'ds:1\', hash: \'2\', data:', '"key": "ds:1", "hash": "2", "data":')
    .replace('sideChannel:', '"sideChannel":');

  const jsonData = JSON.parse(rawDataScript);

  try {
    const chips = jsonData.data[1][0][0][1];
    const tbs = jsonData.data[7][0];
    const results = jsonData.data[56][1][0][0][1][0];
    const nextPageData = [
      jsonData.data[56][1][0][0][0][0]['444383007'][12][11],
      jsonData.data[56][1][0][0][0][0]['444383007'][12][16]
    ];

    return [chips, tbs, results, nextPageData];
  } catch (error) {
    return [null, null, null, null];
  }
}

function parseJsonData(jsonData) {
  let jsonToParse;
  jsonData.split('\n').forEach((line) => {
    if (line.includes('["wrb.fr","HoAMBc",')) {
      jsonToParse = JSON.parse(line)[0][2];
    }
  });

  if (jsonToParse) {
    jsonToParse = JSON.parse(jsonToParse);
    const results = jsonToParse[56][1][0][0][1][0];
    const nextPageData = [
      jsonToParse[56][1][0][0][0][0]['444383007'][12][11],
      jsonToParse[56][1][0][0][0][0]['444383007'][12][16]
    ];

    return [results, nextPageData];
  }

  return [null, null];
}

function parseChipsData(chipsData) {
  return chipsData.map((chip) => ({
    name: chip[0],
    thumbnail: chip[0][1][0],
    link: chip[2]
  }));
}

function parseTbsData(tbsData) {
  return tbsData.map((category) => ({
    name: category[1],
    specificValues: category[7].slice(1).map((value) => ({
      name: value[1],
      link: value[0]
    }))
  }));
}

function parseResultsData(resultsData) {
  const cleanedResults = [];
  resultsData.forEach((result) => {
    const data = result[0][0]['444383007'];
    if (data) {
      try {
				const titleKey = Object.keys(data[1][25]).pop();
				const titleValue = data[1][25][titleKey]; 
				const lastItem = titleValue ? titleValue[titleValue.length - 1] : null;
				const title = Array.isArray(titleValue) ? lastItem : lastValue;

        cleanedResults.push({
          title: title,
          original: {
            url: data[1][3][0],
            width: data[1][3][2],
            height: data[1][3][1]
          },
          thumbnail: {
            url: data[1][2][0],
            width: data[1][2][2],
            height: data[1][2][1]
          },
          sourceWebsite: data[1][25][Object.keys(data[1][25])[Object.keys(data[1][25]).length - 2]][17],
          pageURL: data[1][25][Object.keys(data[1][25])[Object.keys(data[1][25]).length - 2]][2]
        });
      } catch (error) {
  
      }
    }
  });

  return cleanedResults.filter((data) => data !== null);
}

function parseNextPageData(query, data) {
  const firstData = data[0].filter((d) => !Array.isArray(d));
  const secondData = data[0].find((d) => Array.isArray(d));
  const thirdData = data[1][data[1].length - 1];
  const fourthData = data[1][data[1].length - 2];

  const nextPageData = [
    null, null, [...firstData, secondData, [], [], null, null, null, 0], null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null, null, null, null, [query], null, null, null,
    null, null, null, null, null, null, null, null, null, [null, fourthData, thirdData], null, false
  ];

  return JSON.stringify([[['HoAMBc', `${JSON.stringify(nextPageData)}`, null, 'generic']]]);
}

function checkSafeSearchBlock(htmlContent) {
  const $ = cheerio.load(htmlContent);
  const safeSearchBlock = $('.pctrN .Zd9MXe').text();
  return safeSearchBlock ? safeSearchBlock : null;
}

module.exports = {
  parseJsData,
  parseJsonData,
  parseChipsData,
  parseTbsData,
  parseResultsData,
  parseNextPageData,
  checkSafeSearchBlock
};

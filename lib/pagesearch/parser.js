const cheerio = require("cheerio");

function parseHtmlResult(htmlResult) {
  const $ = cheerio.load(htmlResult);

  let relevantResult = null;
  const relatedQuestions = [];
  const results = [];

  if ($ !== null) {
    const resultsItems = $("div.N54PNb.BToiNc.cvP2Ce");

    if (resultsItems.length !== 0) {
      relevantResult = $("div.ifM9O");

      if (relevantResult !== null) {
        const isFeaturedSnippet =
          $("h2.bNg8Rb.OhScic.zsYMMe.BBwThe").length !== 0;
        const isKnowledgePanel = $("div.kp-header").length !== 0;

        if (isFeaturedSnippet) {
          try {
            let snippetContent = $("span.hgKElc").text();
            const tooltips = $("div.nnFGuf");

            if (tooltips !== null) {
              tooltips.each(function () {
                snippetContent = snippetContent.replace(
                  relevantResult(this).text(),
                  "",
                );
              });
            }

            relevantResult = {
              type: "featured_snippet",
              title: $("h3.LC20lb.MBeuO.DKV0Md").text(),
              url: $("a").attr("href"),
              date: $("span.kX21rb.ZYHQ7e").text() || null,
              answer: $("div.IZ6rdc").text() || null,
              content: snippetContent,
            };
          } catch (error) {
            relevantResult = null;
          }
        } else if (isKnowledgePanel) {
          relevantResult = {
            type: "knowledge_panel",
            heading: $("div.N6Sb2c.i29hTd").text(),
            header: $("div.kp-header div.Z0LcW.t2b5Cf").text(),
            content: $("div.LGOjhe").text() || null,
          };
        } else {
          relevantResult = null;
        }
      }

      const relatedQuestionsBlocks = $('div[jsname="yEVEwb"]');
      if (relatedQuestionsBlocks.length > 0) {
        relatedQuestionsBlocks.each(function () {
          try {
            const question = $(this).find("span.CSkcDe").text();
            relatedQuestions.push(question);
          } catch (error) {}
        });
      }

      resultsItems.each(function () {
        try {
          const resultItem = {
            title: $(this).find("h3.LC20lb.MBeuO.DKV0Md").text(),
            url: $(this).find("a").eq(0).attr("href"),
            description: $(this)
              .find("div.VwiC3b.yXK7lf.lVm3ye.r025kc.hJNv6b.Hdw6tb")
              .text(),
          };
          results.push(resultItem);
        } catch (error) {
          return error;
        }
      });
    }
  }

  return { relevantResult, relatedQuestions, results };
}

module.exports = {
  parseHtmlResult,
};

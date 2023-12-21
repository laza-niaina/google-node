const cheerio = require('cheerio');

function parseHtmlResult(htmlResult) {
    const resultsBlock = cheerio.load(htmlResult);

    let relevantResult = null;
    const relatedQuestions = [];
    const results = [];

    if (resultsBlock !== null) {
        const resultsItems = resultsBlock('div.N54PNb.BToiNc.cvP2Ce');

        if (resultsItems.length !== 0) {
            relevantResult = resultsBlock('div.ifM9O');

            if (relevantResult !== null) {
                const isFeaturedSnippet = relevantResult('h2.bNg8Rb.OhScic.zsYMMe.BBwThe').length !== 0;
                const isKnowledgePanel = relevantResult('div.kp-header').length !== 0;

                if (isFeaturedSnippet) {
                    try {
                        let snippetContent = relevantResult('span.hgKElc').text();
                        const tooltips = relevantResult('div.nnFGuf');

                        if (tooltips !== null) {
                            tooltips.each(function () {
                                snippetContent = snippetContent.replace(relevantResult(this).text(), '');
                            });
                        }

                        relevantResult = {
                            type: 'featured_snippet',
                            title: relevantResult('h3.LC20lb.MBeuO.DKV0Md').text(),
                            url: relevantResult('a').attr('href'),
                            date: relevantResult('span.kX21rb.ZYHQ7e').text() || null,
                            answer: relevantResult('div.IZ6rdc').text() || null,
                            content: snippetContent,
                        };
                    } catch (error) {
                        relevantResult = null;
                    }
                } else if (isKnowledgePanel) {
                    relevantResult = {
                        type: 'knowledge_panel',
                        heading: relevantResult('div.N6Sb2c.i29hTd').text(),
                        header: relevantResult('div.kp-header div.Z0LcW.t2b5Cf').text(),
                        content: relevantResult('div.LGOjhe').text() || null,
                    };
                } else {
                    relevantResult = null;
                }
            }

            const relatedQuestionsBlocks = resultsBlock('div[jsname="yEVEwb"]');
            if (relatedQuestionsBlocks.length > 0) {
                relatedQuestionsBlocks.each(function () {
                    try {
                        const question = relevantResult(this).find('span.CSkcDe').text();
                        relatedQuestions.push(question);
                    } catch (error) {
                        // Handle error if needed
                    }
                });
            }

            resultsItems.each(function () {
                try {
                    const resultItem = {
                        title: relevantResult(this).find('h3.LC20lb.MBeuO.DKV0Md').text(),
                        url: relevantResult(this).find('a').eq(0).attr('href'),
                        description: relevantResult(this)
                            .find('div.VwiC3b.yXK7lf.lVm3ye.r025kc.hJNv6b.Hdw6tb')
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

const { PageSearch } = require("../pagesearch");
const { NewsSearch } = require("../newssearch");
//const pages = new PageSearch("elon");
const news = new NewsSearch("elon musk");
async function main() {
  //console.log(await pages.getResults());
  console.log(`RESULT TEST : ${await news.__getResults()}`);
}
main();

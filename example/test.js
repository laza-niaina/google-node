const { PageSearch } = require("./pagesearch/index");
const tut = new PageSearch("elon");
async function main() {
  console.log(await tut.getResults());
}
main();

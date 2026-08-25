const { GoogleTranslate } = require("../translate");
const { NewsSearch } = require("../newssearch");
const { PageSearch } = require("../pagesearch");
const translation = new GoogleTranslate();
// const news = new NewsSearch("Wang Xiaoyan");
// const pages = new PageSearch("Iphone 16");
// async function webSearch() {
// 	console.log(await pages.getResults());
// }
// async function searchNews() {
// 	console.log(`${JSON.stringify(await news.getResults())}`);
// }
async function translate() {
	const text = "こんにちは世界";

	const translatedText = await translation.translate(text, "auto", "en");
	console.log(translatedText);
}
translate();
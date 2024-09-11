const {GoogleTranslate}=require("../translate");
const { NewsSearch } = require("../newssearch");
const { PageSearch } = require("../pagesearch");
const translation = new GoogleTranslate()
const news = new NewsSearch("Wang Xiaoyan");
const pages = new PageSearch("Iphone 16");
async function WebSearch() {
	console.log(await pages.getResults());
}
async function searchNews() {
	 console.log(`${JSON.stringify(await news.getResults())}`);
}
async function translate() {
	const exp = "こんにちは世界"

	const translated_text = await translation.translate(exp, "auto", "en")
	console.log(translated_text)
}
WebSearch()
const { PageSearch } = require("../pagesearch");
const { NewsSearch } = require("../newssearch");
const { ImageSearch } =
	require("../imagesearch");
const { FileSearch } =
	require("../filesearch");
const { GoogleTranslate } = require("../translate")
const pages = new PageSearch("elon");
const news = new NewsSearch("elon musk");
const images = new ImageSearch("Zuck")
const files = new FileSearch("Père riche", "pdf")
const translation = new GoogleTranslate()

async function WebSearch() {
	console.log(await pages.getResults());
}
async function searchFile() {
	console.log(await files.getResults());
}
async function searchImage() {
	console.log(await images.getFirstResults());
}
async function searchNews() {
	console.log(`${JSON.stringify(await news.getResults())}`);
}
async function translate() {
	const exp = "こんにちは世界"

	const translated_text = await translation.translate(exp, "auto", "en")
	console.log(translated_text)
}

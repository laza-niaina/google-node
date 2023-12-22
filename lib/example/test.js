const { PageSearch } = require("../pagesearch");
const { NewsSearch } = require("../newssearch");
const {ImageSearch}=
require("../imagesearch");
const {FileSearch}=
require("../filesearch");
const pages = new PageSearch("elon");
const news = new NewsSearch("elon musk");
const images= new ImageSearch("Zuck")
const files = new FileSearch("Père riche", "pdf") 

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

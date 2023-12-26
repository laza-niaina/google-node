const {GoogleSearch} = require("./lib/googlesearch");
const {PageSearch} = require("./lib/pagesearch");
const {FileSearch} = require("./lib/filesearch");
const {NewsSearch} = require("./lib/newssearch");
const {ImageSearch} = require("./lib/imagesearch");
const {GoogleTranslate}=require("./lib/translate")
module.exports = {
  GoogleSearch,
  PageSearch,
  FileSearch,
  NewsSearch,
  ImageSearch,
	GoogleTranslate
};

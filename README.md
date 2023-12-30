# Google Node

[![GitHub license](https://img.shields.io/github/license/laza-niaina/google-node)](https://github.com/laza-niaina/google-node/blob/main/LICENSE)


## Installation
Clone and import this repo in your project 

````bash 
git clone https://github.com/laza-niaina/google-node
````

## Usage 

<h3>Google WebSearch :</h3>
	
````javascript
const { PageSearch } = require("./google-node");
const pages = new PageSearch("Elon musk");
async function WebSearch() {
	console.log(await pages.getResults());
}
WebSearch()
````

<h3>Google ImageSearch :</h3>
	
````javascript
const {ImageSearch}=
require("./google-node");
const images= new ImageSearch("Mark Zuck")
async function searchImage() {
	console.log(await images.getFirstResults());
}
searchImage()
````

<h3>Google NewsSearch :</h3>
	
````javascript
const { NewsSearch } = require("./google-node");
const news = new NewsSearch("Wang Xiaoyan");
async function searchNews() {
	 console.log(`${JSON.stringify(await news.getResults())}`);
}
searchNews()
````

<h3>Google FileSearch :</h3>

````javascript
const {FileSearch}=
require("./google-node");
const files = new FileSearch("Père riche", "pdf") 
async function searchFile() {
	console.log(await files.getResults());
}
searchFile()
````

<h3>Google Translate :</h3>

````javascript
const {GoogleTranslate}=require("./google-node");
const translator = new GoogleTranslate()
async function translate(){
	const exp = "こんにちは世界"
	const translated_text=await translator.translate(exp,"auto","en")
	console.log(translated_text)
}
translate();
````


> [!NOTE]
>A full example can be found [here](https://github.com/laza-niaina/google-node/lib/example/test.js)


## License
MIT

## To do 
<li>Add Google Lens</li>

## DONATE ME

<a href="https://www.buymeacoffee.com/lazaniaina.r" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

<li>BTC : 15WdpVafhFUBSiH9AKxZgKWAiocGVk3CxC</li>
<li>ETH : 0xCB260c63A68c00b3d580DEA1D9bb7401f856a03C</li>
<li>LTC : MPXZMTjpSunvDJRXoTa7bLHtdd3HAWpV6i</li>
<li>USDT (TRC20) : TTMhTopaNo5agXDqchcv1F1op27KxftNky</li>


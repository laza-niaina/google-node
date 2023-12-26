const {DEFAULT_SERVICE_URLS,LANGUAGES}=require('./constants')
const axios=require("axios")
const { Readable } = require('stream');
const URL_SUFFIXES = DEFAULT_SERVICE_URLS.map(url => url.match(/translate\.google\.(.*)/)[1]);
const DEFAULT_URL_SUFFIX = "com";

class GoogleTranslateError extends Error {
	constructor(msg, { tts, response } = {}) {
		super(msg || GoogleTranslateError.inferMsg(tts, response));
		this.tts = tts || null;
		this.response = response || null;
	}

	static inferMsg(tts, response) {
		return "Unknown error";
	}
}

class TranslatedText {
	constructor({ text, src_lang, dest_lang, src_pronunciation, dest_pronunciation }) {
		this.text = text;
		this.src_lang = src_lang;
		this.dest_lang = dest_lang;
		this.src_pronunciation = src_pronunciation;
		this.dest_pronunciation = dest_pronunciation;
	}

	toString() {
		return Array.isArray(this.text) ? this.text[1] : this.text;
	}

	toObject() {
		return {
			text: this.text,
			src_lang: this.src_lang,
			dest_lang: this.dest_lang,
			src_pronunciation: this.src_pronunciation,
			dest_pronunciation: this.dest_pronunciation
		};
	}
}

class GoogleTranslate {
	constructor(url_suffix = "com", timeout = 5000, proxies = null) {
		this.url_suffix = URL_SUFFIXES.includes(url_suffix) ? url_suffix : DEFAULT_URL_SUFFIX;
		this.url_base = `https://translate.google.${this.url_suffix}`;
		this.url = `${this.url_base}/_/TranslateWebserverUi/data/batchexecute`;
		this.timeout = timeout;
		this.proxies = proxies;

		this.session = axios.create({
			headers: {
				"Referer": `${this.url_base}/`,
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36",
				"Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
			},
			timeout: this.timeout,
			proxy: proxies
		});
	}

	packageRpc(text, langSrc = "auto", langTgt = "en") {
		const GOOGLE_TTS_RPC = ["MkEWBc"];
		const parameter = [[text.trim(), langSrc, langTgt, true], [1]];
		const escapedParameter = JSON.stringify(parameter, (key, value) => (value === undefined ? null : value), 2);
		const rpc = [[[GOOGLE_TTS_RPC[Math.floor(Math.random() * GOOGLE_TTS_RPC.length)], escapedParameter, null, "generic"]]];
		const escapedRpc = JSON.stringify(rpc, (key, value) => (value === undefined ? null : value), 2);
		const freqInitial = `f.req=${encodeURIComponent(escapedRpc)}&`;
		return freqInitial;
	}

	async translate(text, srcLang = "auto", destLang = "en") {
		try {
			if (srcLang !== "auto" && !LANGUAGES.hasOwnProperty(srcLang)) {
				throw new Error("Invalid source language");
			}
			if (!LANGUAGES.hasOwnProperty(destLang)) {
				throw new Error("Invalid target language");
			}

			text = String(text);
			if (text.length >= 5000) {
				throw new GoogleTranslateError("The text to be translated must be less than 5000 characters");
			}
			if (text.trim().length === 0) {
				return new TranslatedText({ text: "", src_lang: srcLang, dest_lang: destLang });
			}

			const freq = this.packageRpc(text, srcLang, destLang);
			const response = await this.session.post(this.url, freq);

			const readableStream = new Readable({
				read() {}
			});

			response.data.split('\n').forEach(line => {
				readableStream.push(line);
			});

			readableStream.push(null);
			return new Promise((resolve, reject) => {
			readableStream.on('data', line => {
				const decodedLine = line.toString('utf-8');
				if (decodedLine.includes("MkEWBc")) {
					try {
						const resData = JSON.parse(decodedLine);
					const responseArray = JSON.parse(resData[0][2]);
						const detectLang = responseArray[0][2];

						const resDataArray = responseArray[1][0];
						if (resDataArray.length === 1) {
							const sentences = resDataArray[0][5] || resDataArray[0][0];
							
							const translatedText = Array.isArray(sentences) ? sentences.map(sentence => sentence[0]).join(' ') : sentences;
				
								resolve(new TranslatedText({
												 text: translatedText,
												 src_lang: [detectLang, LANGUAGES[detectLang.toLowerCase()]],
												 dest_lang: [destLang, LANGUAGES[destLang]],
												 src_pronunciation: null,
												 dest_pronunciation: null
											 }))
						} else if (resDataArray.length === 2) {
							const sentences = resDataArray.map(item => item[0]);
							const pronounceSrc = responseArray[0][0];
							const pronounceTgt = responseArray[1][0][0][1];
						resolve(new TranslatedText({
								text: sentences,
								src_lang: [detectLang, LANGUAGES[detectLang.toLowerCase()]],
								dest_lang: [destLang, LANGUAGES[destLang]],
								src_pronunciation: pronounceSrc,
								dest_pronunciation: pronounceTgt
							}))
						}
					} catch (error) {
						console.error(error);
						 reject(error);
					}
				}
			});
		});
		} catch (error) {
			if (error.isAxiosError) {
				throw new GoogleTranslateError({ tts: this, response: error.response });
			} else {
				throw error;
			}
		}
	}
}
module.exports={GoogleTranslate};
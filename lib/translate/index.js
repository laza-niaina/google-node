const { DEFAULT_SERVICE_URLS, LANGUAGES } = require('./constants')
const axios = require("axios")
const { Readable } = require('stream');
const URL_SUFFIXES = DEFAULT_SERVICE_URLS.map(url => url.match(/translate\.google\.(.*)/)[1]);
const DEFAULT_URL_SUFFIX = "com";

class GoogleTranslateError extends Error {
	constructor(msg) {
		super(msg || GoogleTranslateError.inferMsg());
	}

	static inferMsg() {
		return "Unknown error";
	}
}

class TranslatedText {
	constructor({ text, srcLang, destLang, rawDetectedLang, confidence, originalText }) {
		this.text = text;
		this.srcLang = srcLang;
		this.destLang = destLang;
		this.rawDetectedLang = rawDetectedLang;
		this.confidence = confidence;
		this.originalText = originalText;
	}

	toString() {
		return Array.isArray(this.text) ? this.text[1] : this.text;
	}

	toObject() {
		return {
			text: this.text,
			srcLang: this.srcLang,
			destLang: this.destLang,
			rawDetectedLang: this.rawDetectedLang,
			confidence: this.confidence,
			originalText: this.originalText,
		};
	}
}

class GoogleTranslate {
	constructor(urlSuffix = "com", timeout = 5000, proxies = null) {
		this.urlSuffix = URL_SUFFIXES.includes(urlSuffix) ? urlSuffix : DEFAULT_URL_SUFFIX;
		this.urlBase = `https://translate.google.${this.urlSuffix}`;
		this.url = `${this.urlBase}/_/TranslateWebserverUi/data/batchexecute`;
		this.timeout = timeout;
		this.proxies = proxies;

		this.session = axios.create({
			headers: {
				"Referer": `${this.urlBase}/`,
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
				return new TranslatedText({ text: "", srcLang, destLang });
			}

			const freq = this.packageRpc(text, srcLang, destLang);
			const response = await this.session.post(this.url, freq);

			const readableStream = new Readable({
				read() { }
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
							const originalText = resDataArray[0] && resDataArray[0][5] && resDataArray[0][5][0] && resDataArray[0][5][0][6];
							const confidenceData = responseArray[0][3];
							const confidence = confidenceData && Array.isArray(confidenceData) && confidenceData.length > 1 ? confidenceData[1] : null;

							if (resDataArray.length === 1) {
								const sentences = resDataArray[0][5] || resDataArray[0][0];
								const translatedText = Array.isArray(sentences) ? sentences.map(sentence => sentence[0]).join(' ') : sentences;

								resolve(new TranslatedText({
									text: translatedText,
									srcLang: [detectLang, LANGUAGES[detectLang.toLowerCase()]],
									destLang: [destLang, LANGUAGES[destLang]],
									rawDetectedLang: detectLang,
									confidence,
									originalText
								}));
							} else if (resDataArray.length === 2) {
								const sentences = resDataArray.map(item => item[0]);

								resolve(new TranslatedText({
									text: sentences,
									srcLang: [detectLang, LANGUAGES[detectLang.toLowerCase()]],
									destLang: [destLang, LANGUAGES[destLang]],
									rawDetectedLang: detectLang,
									confidence,
									originalText
								}));
							}
						} catch (error) {
							reject(error);
						}
					}
				});
			});
		} catch (error) {
			if (error.isAxiosError) {
				throw new GoogleTranslateError({ tts: this, response: error.response });
			}
			throw error;
		}
	}
}
module.exports = { GoogleTranslate };
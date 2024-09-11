const extractHtmlBlock = (text) => {
  const pattern = /.*?<div\s+data-state-token="[^"]*"[^>]*>.*?<\/div>/;
  const html = text.replace(pattern, "");

  return html;
};

module.exports = { extractHtmlBlock };

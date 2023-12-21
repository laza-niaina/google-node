const extractHtmlBlock = (text) => {
  // regex pattern
  const pattern = /(<div data-state-token="[^"]*" decode-data-ved="1"[^>]*>.*?3;\[9\]0;)/s;

  // find matches
  const matches = text.match(pattern);

  // process matches
  if (matches) {
    // remove ending string
    const cleanedMatch = matches[0].replace('3;[9]0;', '');
    return cleanedMatch;
  }

  return null;
};

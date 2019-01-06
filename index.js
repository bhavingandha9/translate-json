/**
 * Pure NodeJS server to translate object values into other language using google cloud translate api
 */

const { Translate } = require('@google-cloud/translate');
const http = require('http');
const { translationApiCountryCode } = require('./countries');

/**
 * You have to give service account json file path into env GOOGLE_APPLICATION_CREDENTIALS
 */
const projectId = 'learning-207204';
const translate = new Translate({
  projectId,
});

/**
 * Example Request(in json): 
  {
	"countryCode":"ES",
	"data": {
		"thanks":"thank you",
		"goodbye": "Good Bye"
	}
 }
*/
function onRequest(req, res) {
  try {
    if (req.method === 'POST' && req.headers['content-type'] === 'application/json') {
      let body = '';
      req.on('data', chunk => {
        body += chunk
      });
      req.on('end', () => {
        let bodyObj = JSON.parse(body);
        let dataObj = bodyObj.data;
        let target = bodyObj.countryCode.toLowerCase();
        if (translationApiCountryCode.includes(target)) {
          let keysArray = Object.keys(dataObj)
          let translatedObj = {};
          let counter = 0;
          keysArray.forEach((singleKey, index) => {
            translate.translate(dataObj[singleKey], target).then(translatedText => {
              counter++;
              translatedObj[singleKey] = translatedText[0];
              if (counter == keysArray.length) {
                sendRes(res, translatedObj)
              }
            }).catch(error => {
              console.log("error", error)
              throw Error();
            })
          })
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Country code not supported by translate api." }));
        }
      })
    } else {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Method should be POST and content-type must be json." }));
    }
  } catch (error) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Method should be POST and content-type must be raw/json with countryCode and data fields." }));
  }
}

function sendRes(res, data) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data))
}

http.createServer(onRequest).listen(9000, () => {
  console.log("server is up on 9000")
});
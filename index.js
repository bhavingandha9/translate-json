
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
  },
  "resUnflat": true
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
        let dataObj = JSON.flatten(bodyObj.data);

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
                sendRes(res, translatedObj, bodyObj.resUnflat)
              }
            }).catch(error => {
              console.log("error", error)
              throw Error();
            })
          })
        } else {
          res.writeHead(400, {
            "Content-Type": "application/json"
          });
          res.end(JSON.stringify({
            message: "Country code not supported by translate api."
          }));
        }
      })
    } else {
      res.writeHead(400, {
        "Content-Type": "application/json"
      });
      res.end(JSON.stringify({
        message: "Method should be POST and content-type must be json."
      }));
    }
  } catch (error) {
    res.writeHead(400, {
      "Content-Type": "application/json"
    });
    res.end(JSON.stringify({
      message: "Method should be POST and content-type must be raw/json with countryCode and data fields."
    }));
  }
}

function sendRes(res, data, resUnflat) {
  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  if (resUnflat) {
    res.end(JSON.stringify(JSON.unflatten(data)))
  } else {
    res.end(JSON.stringify(data))
  }
}

// flatten json 
JSON.flatten = function (data) {
  var result = {};
  function recurse(cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for (var i = 0, l = cur.length; i < l; i++)
        recurse(cur[i], prop + "[" + i + "]");
      if (l == 0) result[prop] = [];
    } else {
      var isEmpty = true;
      for (var p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + "." + p : p);
      }
      if (isEmpty && prop) result[prop] = {};
    }
  }
  recurse(data, "");
  return result;
};

// unflatten json object
JSON.unflatten = function (data) {
  "use strict";
  if (Object(data) !== data || Array.isArray(data)) return data;
  var regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
    resultholder = {};
  for (var p in data) {
    var cur = resultholder,
      prop = "",
      m;
    while (m = regex.exec(p)) {
      cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
      prop = m[2] || m[1];
    }
    cur[prop] = data[p];
  }
  return resultholder[""] || resultholder;
};

http.createServer(onRequest).listen(9000, () => {
  console.log("server is up on 9000")
});

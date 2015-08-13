
var fs = require('fs');
var path = require('path');
var http = require('http');
var url = require('url');
var read = require('node-readability');
var qs = require('querystring');
var google = require('google');
var bot = require('nodemw');

google.resultsPerPage = 25;
var nextCounter = 0;

var client = new bot({
  server: 'es.wikipedia.org',
  path: '/w',
  debug: false
});

var route = {
  routes: {},
  for: function(method, path, handler) {
    this.routes[method + path] = handler;
  }
};

function onRequest(req, res) {
  var pathname = url.parse(req.url).pathname;
  console.log(req.method, req.url, pathname);
  if(typeof route.routes[req.method + pathname] === 'function') {
    route.routes[req.method + pathname](req, res);
  } else {
    res.writeHead(404, {"Content-Type": "text/plain"});
    res.end("404 No encontrado");
  }
}

var serveStatic = function(res, file) {
  var fileToServe = path.join(__dirname, file);
  var stream = fs.createReadStream(fileToServe);
  stream.pipe(res);
}

var skipToQueryReq = function(string) {
  var first = string.search(/\?/);
  if(first == -1) return "";
  return string.slice(first + 1);
}

/*
 * An unique route to handle a specific query
 * pathURL : /search?q=keyword -> Should be a `q`
 * query   : q=keyword
 * queryObj: {q: keyword}
 * g: google, l: link, w: wikipedia
 */
route.for('GET', '/search', function(req, res) {
  var pathURL = req.url;
  var queryString = skipToQueryReq(pathURL);
  var queryObj = qs.parse(queryString);

  console.log("--->>>>", pathURL);
  console.log("--->>>>", queryString);
  console.log("--->>>>", queryObj);
  res.writeHead(200, {"Content-Type": "text/html"});
  if(queryObj['g'] != undefined) {
    google(queryObj['g'], function(err, next, links) {
      if(err) console.error(err);
      for(var i = 0; i < links.length; i++) {
        res.write(links[i].title + '-' + links[i].link);
        res.write(links[i].description + '\n');
      }
      if(nextCounter < 4) {
        nextCounter += 1;
        if(next) next();
      }
      res.end();
    });
  } else if(queryObj['l'] != undefined) {
    read(queryObj['l'], function(err, article, meta) {
      res.write(article.content);
      article.close();
      res.end();
    });
  } else if(queryObj['w'] != undefined) {
    client.getArticle(queryObj['w'], function(err, data) {
      if(err) {
        console.log(err);
      }
      res.write(data);
      res.end();
    });
  }
});

/*
 * Temporal route(code proofs)
 */
route.for('GET', '/aux', function(req, res) {
  serveStatic(res, 'index.html');
});

http.createServer(onRequest).listen(8080);
console.log("Server started on port 8080");
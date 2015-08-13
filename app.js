
var fs = require('fs');
var path = require('path');
var http = require('http');
var url = require('url');
var read = require('node-readability');
var qs = require('querystring');

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
 */
route.for('GET', '/search', function(req, res) {
  var pathURL = req.url;
  var query = skipToQueryReq(pathURL);
  var queryObj = qs.parse(query);
  console.log("--->", query);
  console.log("--->", queryObj);
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.write("Halo");
  res.end();
});

/*
 * Temporal route(code proofs)
 */
route.for('GET', '/aux', function(req, res) {
  serveStatic(res, 'index.html');
});

http.createServer(onRequest).listen(80);
console.log("Server started on port 80");
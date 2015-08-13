
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

route.for('GET', '/search', function(req, res) {
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.write("Halo");
  res.end();
});

route.for('POST', '/test', function(req, res) {
  var incomming = "";
  req.on('data', function(chunk) {
    incomming += chunk.toString();
  });

  req.on('end', function() {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(incomming);
    res.end();
  });
});

route.for('GET', '/file', function(req, res) {
  serveStatic(res, 'index.html');
});

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

http.createServer(onRequest).listen(3000);
console.log("Server started");

console.log(qs.stringify({foo:'bar','baz':[1,2,3]}));
console.log(qs.parse('q=busqueda&tipo=2'));
// 来自desktop-app
// 待修改

var Evt = require('evt');
var File = null;

var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');

// http server, 处理笔记图片
var Server = {
	// port: 8008,
	// localUrl: 'http://127.0.0.1:8008',
	_started: false,
	_req: null,
	mime: {
	    "css": "text/css",
	    "gif": "image/gif",
	    "html": "text/html",
	    "ico": "image/x-icon",
	    "jpeg": "image/jpeg",
	    "jpg": "image/jpeg",
	    "js": "text/javascript",
	    "json": "application/json",
	    "pdf": "application/pdf",
	    "png": "image/png",
	    "svg": "image/svg+xml",
	    "swf": "application/x-shockwave-flash",
	    "tiff": "image/tiff",
	    "txt": "text/plain",
	    "wav": "audio/x-wav",
	    "wma": "audio/x-ms-wma",
	    "wmv": "video/x-ms-wmv",
	    "xml": "text/xml"
	},
	server: null,
	start: function() {
		var me = this;
		if(me._started) {
			return;
		}
		// return;
		var basePath = process.cwd();
		var server = http.createServer(function (request, response) {
		    var pathname = url.parse(request.url).pathname;
		    me._req = request;
		    if(!pathname) {
		    	return me.e404(response);
		    }
		    while(pathname[0] == '/') {
		    	pathname = pathname.substr(1);
		    }
		    if(pathname == 'api/file/getImage') {
		    	return me.getImage(request, response);
		    } else {
		    	response.end();
		    	return false;
		    }

		    var realPath = basePath + pathname;
		    var ext = path.extname(realPath);
			ext = ext ? ext.slice(1) : 'unknown';

		    fs.exists(realPath, function (exists) {
		        if (!exists) {
		            response.writeHead(404, {
		                'Content-Type': 'text/plain'
		            });
		            response.write("This request URL " + pathname + " was not found on this server.");
		            response.end();
		        } else {
		            fs.readFile(realPath, "binary", function (err, file) {
		                if (err) {
		                    response.writeHead(500, {
		                        'Content-Type': 'text/plain'
		                    });

		                    response.end(err);
		                } else {
		                    var contentType = me.mime[ext] || "text/plain";
							response.writeHead(200, {'Content-Type': contentType});
							response.write(file, "binary");
							response.end();
		                }
		            });
		        }
		    });
		});

		server.listen(Evt.port);
		console.log("Server runing at port: " + Evt.port + ".");

		me.localUrl = Evt.localUrl;
		me._started = true;

		me.server = server;
	},

	// 关闭服务
	close: function() {
		this.server.close(function(err) {
		});
		console.log('close');
		this._started = false;
	},

	e404: function(res) {
		var me = this;
		res.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        res.write("This request URL "  +  me._req.url + " was not found on this server.");
        res.end();
	},

	// 返回图片
	retImage: function(filePath, res) { 
		var me = this;
		var ext = path.extname(filePath);
		ext = ext ? ext.slice(1) : 'unknown';
		filePath = filePath + '';
		fs.readFile(filePath, "binary", function (err, file) {
            if (err) {
                res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                res.end();
            } else {
                var contentType = me.mime[ext] || "text/plain";
				res.writeHead(200, {'Content-Type': contentType});
				res.write(file, "binary");
				res.end();
            }
        });
	},

	getImage: function(req, res) { 
		var me = this;
		// fileId
		var fileId = url.parse(req.url, true).query['fileId'];
		if(!fileId) {
			return me.e404(res);
		}

		if(!File) {
			File = require('file');
		}

		File.getImage(fileId, function(fileLocalPath) {
			if(path) {
				return me.retImage(fileLocalPath, res);
			} else {
				return me.e404(res);
			}
		})
	}
};
module.exports = Server;
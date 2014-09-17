util = require('util');
http = require('http');
querystring = require("querystring");
checker = require('./checker.js');

var __context = {};
var __stepIndex = -1;
var __steps = [];
var __checks =[];
var __ran = [];
var __data =  [];
var __session = '';
//Not needed __config is available
exports.setContext = function (context) {
  __context = context;
	checker.setContext(context);
};

getOption = function(cfg){
var opt =  {
	  hostname: __config.server,
	  port: __config.port,
	  path: __config.baseUrl+cfg.url,
	  method: cfg.method,
	  headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cookie': 'JSESSIONID='+__session
      }
	};
	logger.debug("Request Options",opt);
	return opt;
}

checkSession = function(json){
	if(__context.sessionPath != undefined){
		var node =  checker.getJsonNode(__context.sessionPath,json);
		__session = node;
	}
}

processData = function(data){
	var R = new RegExp(/\$\{([\[\]0-9a-z\.]*)\}/ig),v,d = data;
	while((v = R.exec(data))!=null){
		var step = getStepVariableName(v[1]);
		var dot = v[1].split(".");
		dot.shift();
		var value  =checker.getJsonNode(dot.join("."),__data[step]);
		logger.debug("Processing "+v[0]+" by "+value+" in "+d);
		d.replace(v[0],value);
	}
	logger.debug("Processed "+d);
	return d;
}

getStepVariableName = function(key){
	return key.split(".").shift();
}

runPost = function(cfg,options,checks,callback){
	var data = processData(cfg.data);
	options.headers['Content-Length']=data.length;
	// Set up the request
  var post_req = http.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
      		handleResponse(cfg,chunk,checks,callback);
      });
  });

  // post the data
  logger.debug("Request Data:"+data);
  post_req.write(data+"\n");
  post_req.end();

}

runGet = function(cfg,options,checks,callback){
	var data = processData(cfg.data);
	//Url encode the data
	options.path+=querystring.escape(cfg.data);
	// Set up the request
  var get_req = http.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          handleResponse(cfg,chunk,checks,callback);
      });
  });
logger.debug("Request Data:"+data);
  get_req.end();
}

handleResponse = function(cfg,chunk,checks,callback){
	logger.debug(chunk);
	eval("var response="+chunk);
	checkSession(response);
  var messages = checker.checkResponse(response,checks);
  	//there is no error we can store the result
  	__data[cfg.name]=response;
  if(callback){
  	callback(messages,__steps[__stepIndex]);
  }
}

nextStep = function(messages,step){
	if(messages||step){
		__ran.push({
			messages:messages,
			step:step
		});
	}
	__stepIndex++
	if(__steps.length>__stepIndex){
		var cfg = __steps[__stepIndex];
		var options = getOption(cfg);
		logger.info("Running Step:"+cfg.name);
	    logger.debug("Calling:["+options.method+"] http://"+ options.hostname+":"+options.port+options.path);

		var checks = __checks!=undefined?__checks:[];
		if(cfg.checks){
			checks=checks.concat(cfg.checks);
		}
		logger.debug("Loaded checks: ",checks);
		logger.debug("++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
		if(cfg.method.toUpperCase() == 'POST'){
			runPost(cfg,options,checks,nextStep);
		  }else{
		  	runGet(cfg,options,checks,nextStep);
		  }
	}else{
		if(__endCallback){
			__endCallback(__ran);
		}
	}

}

/**/
exports.run = function(steps,checks,endCallback){
		__stepIndex = -1;
		__steps = steps;
		__checks =checks
		__endCallback = endCallback;
		nextStep();
}
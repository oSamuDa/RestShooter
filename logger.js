fs = require("fs");
querystring = require("querystring");

var __context = {};
exports.setContext = function (context) {
  __context = context;
  if(__context.report && fs.existsSync(__context.report)){
	  //Remove the file create at the previous build
	  fs.unlinkSync(__context.report);
	}
};

exports.debug = function(message,data){
	if(__context.debug){
		console.log(message);
		if(data!=undefined){
			console.log( data);
		}
	}
}

exports.info = function(message,data){
	console.info(message);
	if(data!=undefined){
		console.info( data);
	}
}

exports.error = function(message,data){
	console.error(message);
	if(data!=undefined){
		console.error( data);
	}
}

exports.writeReport = function(result){	
	if(__context.report){
		writeLine("Report Generate at :"+new Date());
		writeLine("Test scenario ran: "+result.length);
		writeLine("Test step failed: "+getFailNumber(result));
		for(var i=0;i<result.length;i++){
			for(var j=0;j<result[i].length;j++){
				writeResult(result[i][j]);
			}
		}
	}
}

getFailNumber = function(result){
	var count = 0;
	for(var i =0;i<result.length;i++){
		for(var j =0;j<result[i].length;j++){
			if(result[i][j].messages.length>0){
				count++;
			}
		}
	}
	return count;
}

writeResult = function(result){
	writeLine(result.step.name);
	writeLine("=============");
	for(var i =0;i<result.messages.length;i++){
		writeLine(result.messages[i]);
	}
	writeLine("=============");
}

writeLine = function(line){
	if(__context.report){
		if(fs.existsSync(__context.report)){
			fs.appendFileSync(__context.report, line+"\n");
		}else{
			fs.writeFileSync(__context.report, line+"\n");
		}
	}
}
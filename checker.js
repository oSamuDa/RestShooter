util = require('util');
assert = require('assert');

var __context = {};
exports.setContext = function (context) {
  __context = context;
};
//This method can break
exports.getJsonNode = function(path,response){
	return getJsonNode(path,response);
}

getJsonNode = function(path,response){
	logger.debug("getJsonNode ->"+path);
	var dot = path.split('.');
	var o = response;
	try{
		while(dot.length>0){
			var key = dot.shift();
			if(key.indexOf('[')!=-1){
				var index = key.substr(key.indexOf('[')+1,key.indexOf(']')-(key.indexOf('[')+1));
				key=key.substr(0,key.indexOf('['));
				o=o[key][index];
			}else{
				o=o[key];
			}
		}
	}catch(e){

	}
	return o;
}


exports.checkResponse = function(response,checks){
	logger.info("-------------------------------------------------");
	var messages = [];
	for(var i=0;i<checks.length;i++){		
		logger.info("Checking:"+checks[i].path);
		var node = getJsonNode(checks[i].path,response);
		if(node == undefined){
			messages.push("Node not found for "+checks[i].path,node);
		}else{
			if(checks[i].test){
				var tests = checks[i].test.split("|");
				while(tests.length>0){
					switch(tests.shift()){
						case 'exist':
							if(node==undefined)messages.push("The "+checks[i].path+" must exist in the answer");
							break;
						case 'notempty':
							if(node=='')messages.push("The "+checks[i].path+" must not be empty in the answer");
							break;
					}
				}
			}
		}
		if(checks[i].value){
			if(node != checks[i].value){
				messages.push("Expected value for "+checks[i].path+" is "+checks[i].value+" but was "+node);
			}
		}
	}
	logger.info("########################################################");
	return messages;

}
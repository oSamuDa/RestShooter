console.log("==== REST Shooter ====")
fs = require("fs");
util = require('util');
http = require('http');
assert = require('assert');
runner = require('./runner.js');
logger = require('./logger.js');

//NO default config, this globale variable to be accessed everywhere
__config =  {
	baseUrl:'',
	port:80,
	method:'GET'
};
//The list of tests to run
__testConfigs = [];
//The current index of the test to run
__testIndex = -1;
__result = [];

setUp = function(cfg){
	__config = cfg;
	logger.debug("--------------------");
	logger.debug("Server:"+__config.server);
	logger.debug("Scenario:"+__config.scenario);
	logger.debug("Report:"+__config.report);
	logger.debug("--------------------");
	runner.setContext(__config);
	logger.setContext(__config);
}

/*Callback once the test is done*/
nextTest = function(ran){
	if(ran){
		__result.push(ran);
	}
	__testIndex++;
	if(__testIndex<__testConfigs.length){
		logger.debug("========================================================");
		logger.info("--> Run test ["+__testIndex+"]:"+__testConfigs[__testIndex].name);
		//Run the scenario with the common checks
		runner.run(__testConfigs[__testIndex].steps,__testConfigs[__testIndex].checks,nextTest);
	}else{
		logger.info("Writting report");
		logger.writeReport(__result);
	}
}

startTesting = function(){
	console.log("Start testing");
	nextTest();
}

loadedTest = function(name,testCfg){
	logger.debug("Scenario loaded:"+name);
	//Check the subtests
	for(var i=0;i<testCfg.steps.length;i++){
		if(typeof testCfg.steps[i] == 'string'){
			//Load step
			logger.debug("Loading step : "+testCfg.steps[i]);
			var data = fs.readFileSync(testCfg.steps[i], 'utf-8');	
			eval("var subTests="+data);
			testCfg.steps[i]=subTests;
		}
	}
	__testConfigs.push(testCfg);
	if(__testConfigs.length==totalTest){
		startTesting();
	}
}

loadTests = function(list){
	totalTest = list.length;
	for(var i=0; i<list.length;i++){
		var fileName = list[i];
		__loadTest(fileName);	
	}
}

__loadTest = function(fileName){
	fs.readFile(fileName, 'utf-8', function (error, data) {
			if(error){util.error(error);return;}
			eval("var testConfig="+data);
			loadedTest(fileName,testConfig);
			});
}


logger.debug("Reading config file : "+process.argv[2]);
//Entry point of the program
fs.readFile(process.argv[2], 'utf-8', function (error, data) {
			if(error){util.error(error);return;}
			eval("var cfg="+data);
			setUp(cfg);
			loadTests(cfg.scenario);
			});


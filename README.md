RestShooter
===========

Rest Shooter is a node module able to take a list of scenario of URLs to call and check the response.
A Scenario is a list of steps, a step is a URL with parameter and checks (optional)


* Run POST and GET
* Check global field for a scenario
* Check specific field for a step
* Support only JSON for now
* Propagate the Session over the whole scenario
 
How to use it
=============

First we have to define the configuration, one per platform to target

```javascript
{
	"server":"localhost",
	"port":9091,
	"baseUrl":"/rest",
	"scenario":[
		"login.scn"
	],
	"sessionPath":'sessionId',
	"report":"myreport.log"
}
```

**server** is the server to target in our exemple it is localhost (no HTTP, no port, only server name)
**port** is the port to use to contact the server
**baseUrl** will be added in front of all URL to call (Usualy if you have a REST service on a dedicated path) you can leave blank
**scenario** is an array of scenario to run, files that will be loaded independently
**sessionPaht** is the path in one of the JSON returned in the scenario that will give the session for the rest of the application (Will move to a Javascript function to make it more modular)
**Report** is the file where is report will be written at the end of the test


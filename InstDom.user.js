// ==UserScript==
// @name        _Track dynamically added elements
// @namespace   http://localhost
// @description log the DOM create element events
// @include     *
// == http://www.eventracer.org/race_bug.html
// @run-at      document-start
// @require     https://ajax.googleapis.com/ajax/libs/prototype/1.7.2.0/prototype.js
// ==/UserScript==
//--- Intercept and log document.createElement().

//status:
//1. solved the problem that the instrumentation is executed too late.
//2. can handle the example, but only with static html event handlers.

//missing: 
//1. arguments of function 
//2. we can only handle static html now, because I don't know how to instrument .onclick and let observer triger it

//1. observer create new element(include scripts)
//2. if sci

//LogNewTagCreations();
//function LogNewTagCreations() {
console.log('  <Inst:>Instrumentation start');

var observer = new MutationObserver(function(mutations) {
	// console.log("This is " + this);
	mutations.forEach(function(mutation) {
		// console.log("-->\n");
		// console.log("Mutation type: " + mutation.type);

		// if(mutation.type)
		handleAddedNodes(mutation.addedNodes);
		// console.log("\n<--\n");
	});
});

observer.observe(document, {
	childList : true,
	attributes : true,
	characterData : true,
	attributeOldValue : true,
	characterDataOldValue : true,
	subtree : true
});

// window.onload = function(e) {
// console.log("window.onload");
// }

var event1_id = "image1";
var event1_type = "onclick";
var event1_function = true;
// need to specify the function?

var event2_id = "image2";
var event2_type = "onclick";
var event2_function = true;

function add_script_to_DOM(script_text) {
	// the function takes in the piece of javascript code as a string, and
	// added it to the DOM
	// note that: all codes here are out of the scope of document, here we
	// can access the dom, but dom can't access here
	var s = document.createElement('script');
	s.type = 'text/javascript';
	// var code = 'var test111=1;';
	try {

		console.log("Add the script into the DOM:\n");
		console.log(script_text);

		s.appendChild(document.createTextNode(script_text));
		document.body.appendChild(s);
	} catch (e) {
		// s.text = code;
		// document.body.appendChild(s);
	}
}

function getFunction(node, type) {
	// the function that return the event handler from the dom.
	// note that: we only handle static html now, we can also easily access
	// to element.onclick from here by iterating all event types
	var retVal = node.getAttribute(type).toString();
	if (retVal) {
		retVal = retVal + ';';
		return retVal;
	} else {
		return null;
	}
}

// var existing_eventhandler [ element ][handler];

function check_event_handler_change(id1, type1, id2, type2) {
	// 1. iterate all elements,check the event handlers for all types
	// 2. if racing element, and also the racing type, then
	// 3.old event handlers are stored into the object's eh['type'].[index]
	
	

	event_handler_types = [ "onclick", "onload", "onabort", "onblur",
			"onchange", "ondblclick", "onerror", "onfocus", "onkeydown",
			"onkeypress", "onkeyup", "onmousedown", "onmousemove",
			"onmouseout", "onmouseover", "onmouseup", "onreset", "onresize",
			"onselect", "onsubmit", "onunload", "onscroll" ];
	//
	// console.log("---> " + event_handler_types);
	//
	// for (eh in event_handler_types) {
	// console.log(eh + "::---> " + event_handler_types[eh]);
	// }

	// traverse all elements in the document
	var items = document.querySelectorAll("*");
	var element, i, len = items.length;
	for (i = 0; i < len; i++) {
		element = items[i];
		element.id = element.identify();

		var currEh;
		for (eh_type in event_handler_types) {
			// console.log(element.id+"::---> " + event_handler_types[eh]);
			switch (event_handler_types[eh_type]) {
			case "onclick":
				currEh = element.onclick;
				step1_classify_ehs(element, currEh);
				break;
			case "onload":
				currEh = element.onload;
				step1_classify_ehs(element, currEh);
				break;
			default:

			}

		}
	}	
	function step1_classify_ehs(target, currEh){
		if (currEh) {
			console.log(target.id + "::--->  "
					+ event_handler_types[eh_type]);
			console.log(currEh.toString());
		}		
	}
	
	function get_element_eh_list(element){
		if(!element.ehs){
			element.ehs = new Object();
		}
		return element.ehs;
	}

}
// myVars.event1.id=id1;
// myVars.event1.type=type1;
// myVars.event2.id=id2;
// myVars.event2.type=type2;

// var newly_changed_eventhandler[element][handler];
// foreach(element){
// foreach(attribute of element) {
// if (attribute is "onclick")
// if (attribute != existing_eventhandler[element]) {
// newly_changed_eventhandler[element] = attribute;
// }
// existing_eventhandler[element] = attribute;
// }
// }
//	
// foreach (element,handler) in newly_changed_eventhandler {
// var lu_handler = function () {
// console.log();
// }
// element.onclick = lu_handler;
// }
//	
//
//		
//	
//		
// var onclick_fn[element]=element.onclick.toString();
// if(onclick_fn[element]!= onclick_fn_old[element]){
// instrument onclick_fn[element];
// }
//		
// }

// myVars.stooge = {
// "first-name" : "Joe",
// "last-name" : "Howard"
// };
// MYAPP.flight = {
// airline : "Oceanic",
// number : 815,
// departure : {
// IATA : "SYD",
// time : "2004-09-22 14:55",
// city : "Sydney"
// },
// arrival : {
// IATA : "LAX",
// time : "2004-09-23 10:42",
// city : "Los Angeles"
// }
// };

function scripts_first_to_add() {
	add_script_to_DOM("var myVars = {};");
	console.log(myVars);
}

function setFunction(node, type, fn) {
	// the function that set the event handler of node, type to fn
	// note that this way only change the attribute of static html, works
	// for this example
	// console.log("setFunction: to node: " + node.id + " , type: " + type
	// + " , function: " + fn);
	node.setAttribute(type, fn + "();");
}

function instrument_fn_e1(fn) {
	// instrument fn of e1, by making the script content and added it to DOM
	// return "replace_e1"
	// console.log(fn);
	// console.log("Instrumented fn of e1: " + fn + "\n");
	var replace_e1 = "function replace_e1(){" + "var count=0;"
			+ "var interval1 = setInterval(function() {"
			+ "console.log('Postpone time: '+ count);count++;"
			+ "if (event2_executed) {" + "clearInterval(interval1);" + fn + "}"
			+ "}, 1000);" + "}";
	add_script_to_DOM(replace_e1);
	// console.log(replace_e1);
	return "replace_e1";
}

function instrument_fn_e2(fn) {
	// instrument fn of e2, by making the script content and added it to DOM
	// return "replace_e2"
	// console.log("Instrumented fn of e2: " + fn + "\n");
	var replace_e2 = "function replace_e2(){" + "event2_executed=true;" + fn
			+ "}";
	add_script_to_DOM(replace_e2);
	// console.log(replace_e2);
	return "replace_e2";
}

function check_event_listener(node, type) {
	// check event handlers when the node is created, whether match our
	// expecting handlers
	// below is the occurance we need to monitor the event handlers
	// 1. create element <- we did this
	// 2. change the html setAttribute
	// 3. element.onclick
	// 4. element.on("click")
	// 5. element.bind()...
	// 6. element.addEventListner...

	// if (node.id == event1_id) {
	//
	// // var observer3 = new MutationObserver(function(mutations) {
	// // // console.log("This is " + this);
	// // mutations.forEach(function(mutation) {
	// // // console.log("-->\n");
	// // console.log("Mutation type: " + mutation.type);
	// //
	// // // if(mutation.type)
	// // // handleAddedNodes(mutation.addedNodes);
	// // // console.log("\n<--\n");
	// // });
	// // });
	// //
	// // observer3.observe(node, {
	// // childList : true,
	// // attributes : true,
	// // characterData : true,
	// // attributeOldValue : true,
	// // characterDataOldValue : true,
	// // subtree : true
	// // });
	// // console.log("observer3: ", observer3);
	// //
	// // node.setAttribute("onclick", "test1();");
	// //
	// // node.onclick = function() {
	// // console.log("test observer 3");
	// // };
	//
	// Event.observe(node, 'click', function(event) {
	// console.log("test observer 4");
	// });
	// }

	if (node.id == event1_id) {
		if (type == event1_type) {
			// console.log("Added Node: " + node + " : " + node.outerHTML);
			add_script_to_DOM('var event2_executed=false;');
			console.log("Event 1 match!");
			var fn = getFunction(node, type);
			var newFn = instrument_fn_e1(fn);
			setFunction(node, type, newFn);

		}
	} else if (node.id == event2_id) {
		if (type == event2_type) {
			// console.log("Added Node: " + node + " : " + node.outerHTML);
			console.log("Event 2 match!");
			var fn = getFunction(node, type);
			var newFn = instrument_fn_e2(fn);
			setFunction(node, type, newFn);
		}
	}

}

function handleAddedNodes(nodes) {
	// iterate all nodes added at one time, it seems the observer is coarse
	// than we expected

	// testInsert();
	[].forEach.call(nodes, function(node) {

		if (node.outerHTML != undefined) {
			// console.log("----------------------------------------------\nNode:
			// " + node.identify());

			// console.log("Added Node: " + node + " : " + node.outerHTML);

			// add to body the instrumented
			if (node == document.body) {
				scripts_first_to_add();
				add_script_to_DOM(check_event_handler_change.toString());
				// check_event_handler_change();

			}

			if (node.getAttribute("onload")) {
				// console.log("Onload: " + node.getAttribute("onload"));
				check_event_listener(node, "onload");

			}
			if (node.getAttribute("onclick")) {
				// console.log("onclick: " + node.getAttribute("onclick"));
				check_event_listener(node, "onclick");
			}

			// console.log("\n->parent Node: " + node.parentNode);
			// if (node.identify()) {
			// console.log(node.identify());
			// }

		}
	});
}

//
//  
//  

// ------------- document object's apis
// var oldDocumentCreateElement = document.createElement;
// document.createElement = function (tagName) {
// var elem = oldDocumentCreateElement.apply (document, arguments);
// console.log ("CW_document.createElement( ", tagName, " ). Link: ", elem);
// return elem;
// }
// var olddocumentgetElementById = document.getElementById;
// document.getElementById = function(elementId){
// console.log (arguments.callee, "getElementById :", elementId);
// return olddocumentgetElementById.apply(document, arguments);
// }
// var olddocumentAddEventListener = document.addEventListener;
// document.addEventListener = function (type, fn) {
// olddocumentAddEventListener.apply(document, arguments);
// console.log('CW_document.addEventListener: type: ' + type + ', function:
// ,' + fn);
// }
// //------------- window object's apis
// var oldWindowAddEventListener = window.addEventListener;
// window.addEventListener = function (type, fn) {
// oldWindowAddEventListener.apply(window, arguments);
// console.log('CW_window.addEventListener: type: ' + type, ', function: ,'
// + fn);
// }
// ------------- element apis
var f = EventTarget.prototype.addEventListener; // store original
EventTarget.prototype.addEventListener = function(type, fn, capture) {
	this.f = f;
	// //we have alread load in the pair of functions: GGG() and FFF(),
	// //where we want GGG() to be invoked before FFF()
	// var newfn = function () {
	// if (fn.name == FFF.name) {
	// //we need to call GGG()
	// // let's call GGG here
	// }
	// // call fn()
	// }
	// this.f(type, newfn, capture); // call original method

	var newfn = function() {
		// console.log("--------------------------------\nInstrument
		// addeventlistener
		// code here");
		fn();
	}

	this.f(type, newfn, capture); // call original method
	console.log('  <Inst:>--Added Event Listener: on target: ' + this
			+ '\n  <Inst:>--                           Type: ' + type
			+ '\n  <Inst:>--                       function: ' + fn);
	// console.log('\nAdded Event Listener: on' + type);
	// fn = fireanothera,
	// fn;
	console.log('  <Inst:>--This is: ' + this + "\n");
}

// //------------- create an observer instance
// // Create an observer object and assign a callback function
// // select the target node
// var target = document.querySelector('#some-id');
// // create an observer instance
// var observer = new MutationObserver(function (mutations) {
// mutations.forEach(function (mutation) {
// console.log('mutation:' + mutation.type);
// });
// });
// // configuration of the observer:
// var config = {
// attributes: true,
// childList: true,
// characterData: true
// };
// // pass in the target node, as well as the observer options
// console.log('observing target: ' + target);
// observer.observe(target, config);
// // later, you can stop observing
// // observer.disconnect();
console.log('  <Inst:>Instrumentation finish');
// }
// --- Handy injection function.

// function addJS_Node(text, s_URL, funcToRun) {
// var D = document;
// var scriptNode = D.createElement('script');
// scriptNode.type = 'text/javascript';
// if (text)
// scriptNode.textContent = text;
// if (s_URL)
// scriptNode.src = s_URL;
// if (funcToRun)
// scriptNode.textContent = '(' + funcToRun.toString() + ')()';
// var targ = D.getElementsByTagName('head')[0] || D.body || D.documentElement;
// targ.appendChild(scriptNode);
// }
// /*--- The userscript or GM script will start running before the DOM is
// available.
// Therefore, we wait...
// */
//
// var waitForDomInterval = setInterval(function() {
// console.log('ready? document:', document);
// console.log('ready? head:', document.head);
// var domPresentNode;
// if (typeof document.head == 'undefined') {
// console.log('head is not defined yet');
// domPresentNode = document.querySelector('head, body');
// } else {
// domPresentNode = document.head;
// if (domPresentNode) {
// clearInterval(waitForDomInterval);
// addJS_Node(null, null, LogNewTagCreations);
// }
// }
// }, 1);

var map = document.getElementById("map");
var get_data;
var request_data;
var errors = mapWidth = mapHeight = countY = countX = 0;
var zoom = 2;
var defaultDX = 18;
var defaultDY = 8;

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getPosition);
    } else {
    	errors++;
        map.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function getPosition(position) {
	get_data = {x: position.coords.latitude, y: position.coords.longitude, dx: defaultDX, dy: defaultDY};
	getRequest(get_data);
}

function getRequest(data, prefix) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
		    request_data = JSON.parse(xhttp.responseText);
		    getCountInRow();
    		getMapWidthHeight();
		}
	};
	xhttp.open("GET", "get_request"+(prefix ? prefix : '')+".json?" + jQuery.param(data), true);
	xhttp.send();
}

function getCountInRow() {
	countX = Math.ceil(get_data.dx/request_data[0].dx);
	countY = Math.ceil(get_data.dy/request_data[0].dy);
	if (countX*countY != request_data.length) {
		errors++;
		map.innerHTML = 'bad request';
	}
}

function getMapWidthHeight() {
	var img = new Image;
	img.src = request_data[0].url;
	img.onload = function () {
	   	console.log(img.width, countX);
	    mapWidth = img.width*countX;
		mapHeight = img.height*countY;
		drawMap();
	}
}

function drawMap() {
    request_data.sort(sortData);
    if (errors == 0) {
	    map.innerHTML = '';
	    map.setAttribute("data", JSON.stringify(get_data));
	    map.setAttribute("style", "width: "+mapWidth+"px; height: "+mapHeight+"px;");

		for (i in request_data) {
		 	var img = new Image;
		 	var div = document.createElement('div');
		 	div.setAttribute("class", "item");
		 	div.setAttribute("style", "float: left");
		 	div.setAttribute("data", JSON.stringify(request_data[i]));
		 	if (div.addEventListener) {
			  if ('onwheel' in document) {
			    // IE9+, FF17+, Ch31+
			    div.addEventListener("wheel", mouseScroll);
			  } else {
			    // Firefox < 17
			    div.addEventListener("MozMousePixelScroll", mouseScroll);
			  }
			} else { // IE8-
			  div.attachEvent("onmousewheel", mouseScroll);
			}
			img.src = request_data[i].url;
			map.appendChild(div).appendChild(img);
		}
	}
}

function sortData(a, b) {
    return (b.y - a.y) || (a.x - b.x);
}

function mouseScroll(e){
	e = e || window.event;
	var delta = e.deltaY || e.detail || e.wheelDelta;
	if (delta > 0) {
		var data = JSON.parse(this.getAttribute('data'));
		var new_dx = data.dx*zoom*countX;
		var new_dy = data.dy*zoom*countY;
		/*
		in real get data must be
		get_data = {x: data.x, y: data.y, dx: new_dx, dy: new_dy};
		*/

		get_data = {x: data.x, y: data.y, dx: new_dx > 36 ? 36 : new_dx, dy: new_dy > 16 ? 16 : new_dy};
		getRequest(get_data, get_data.dx == defaultDX ? null : '_up');
	} else {
		var data = JSON.parse(this.getAttribute('data'));
		var new_dx = data.dx/zoom*countX;
		var new_dy = data.dy/zoom*countY;
		/*
		in real get data must be
		get_data = {x: data.x, y: data.y, dx: new_dx, dy: new_dy};
		*/

		get_data = {x: data.x, y: data.y, dx: new_dx < 9 ? 9 : new_dx, dy: new_dy < 4 ? 4 : new_dy};
		getRequest(get_data, get_data.dx == defaultDX ? null : '_down');
	}
}

window.addEventListener("load", getLocation);
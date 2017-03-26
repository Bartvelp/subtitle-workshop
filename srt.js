//I know my js looks horrible, please improve it.
var srtFile;
var webVTT;
function readSRT(input) {
	if (input.files && input.files[0]) {
		var srtFile = input.files[0];
		var srtBlobUrl = URL.createObjectURL(srtFile); //read SRT now convert it to webVTT
		
		var reader = new FileReader();
		reader.onload = function(event) {
		    var SRTtext = event.target.result;
		    webVTT = SRTtext.replace(/(\d\d\:\d\d\:\d\d)\,/g, '$1.');
		    webVTT = "WEBVTT FILE \n\n" + webVTT;
		    displayWebVTT();
		};
		reader.readAsText(srtFile);
	}
}

function delaySubtitle(amountOfSeconds){
	var amountOfSeconds = parseInt(amountOfSeconds);
	var pattern = /(\d\d\:\d\d\:\d\d)\./g;
	while (match = pattern.exec(webVTT)) {
		var secondStringAint = pattern.lastIndex - 3;
		var secondStringBint = pattern.lastIndex - 2;
		var secondStringA = webVTT.charAt(secondStringAint);
		var secondStringB = webVTT.charAt(secondStringBint);
		var second = parseInt(secondStringA + secondStringB);
		var newSecond = second + amountOfSeconds;
		if (newSecond > 59){
			var minuteStringAint = pattern.lastIndex - 5;
			var minuteStringBint = pattern.lastIndex - 6;
			var minuteStringA = webVTT.charAt(minuteStringAint);
			var minuteStringB = webVTT.charAt(minuteStringBint);
			var minute = parseInt(minuteStringA + minuteStringB);
			newMinute = minute++;
			newSecond = newSecond - 60;

			newMinute = newMinute.toString();
			webVTT = setCharAt(webVTT,minuteStringAint, newMinute.charAt(0));
			webVTT = setCharAt(webVTT,minuteStringBint, newMinute.charAt(1));
		}
		newSecond = newSecond.toString();
		webVTT = setCharAt(webVTT,secondStringAint, newSecond.charAt(0));
		webVTT = setCharAt(webVTT,secondStringBint, newSecond.charAt(1));
		displayWebVTT();
	}
}

function displayWebVTT(){
	var webVTTblob = new Blob([webVTT], {
		type: 'text/plain'
	});
	var webVTTBlobUrl = URL.createObjectURL(webVTTblob);
	$("#subtitle").attr("src", "");
	$("#subtitle").attr("src", webVTTBlobUrl);
}

$("#srtInput").change(function(){
	readSRT(this);
});

$("#delayButton").click(function(){
	var delay = $("#delay").val();
	console.log("Delaying by: " + delay + " seconds.");
	delaySubtitle(delay);
});

(function localFileVideoPlayer() {
	'use strict'
  var URL = window.URL || window.webkitURL
  var playSelectedFile = function (event) {
    var file = this.files[0]
    var type = file.type
    var videoNode = document.querySelector('video')
    var fileURL = URL.createObjectURL(file)
    videoNode.src = fileURL
  }
  var inputNode = document.getElementById('videoInput')
  inputNode.addEventListener('change', playSelectedFile, false)
})()

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}

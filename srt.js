//I know my js looks horrible, please improve it.
var webVTT;
var subtitleObject = {};
var videoName;

function srtToObject(srtFile) {
	var reader = new FileReader();

	reader.onload = function(file) {
	    var SRTtext = file.target.result;
	    var allSRTlines = SRTtext.split('\n'); //split all lines 

		currentSubtitleID = 1;
	    for (var i = 0; i < allSRTlines.length; i++) {
	    	if(allSRTlines[i] == currentSubtitleID){ //if the current line is coorensponds with the expected subtitle id, im going to assume it's the start of a new subtitle.
	    		subtitleObject[currentSubtitleID] = {id : currentSubtitleID}; //make new object in the subtitle element with current id of current subtitle
	    		
	    		var timesArray = allSRTlines[i+1].split(" --> "); //hacky way to parse the time for each individual subtitle, and pass them to the subtitle object

	    		var timesBeginning = timesArray[0].split(":");
	    		timesBeginning[2] = timesBeginning[2].replace(",", ".");
	    		var timeInSecondsStart = parseInt(timesBeginning[0]) * 3600 + parseInt(timesBeginning[1]) * 60 + parseFloat(timesBeginning[2]);
	    		subtitleObject[currentSubtitleID].startingTime = timeInSecondsStart;

	    		var timesEnd = timesArray[1].split(":");
	    		timesEnd[2] = timesEnd[2].replace(",", ".");
	    		var timeInSecondsEnd = parseInt(timesEnd[0]) * 3600 + parseInt(timesEnd[1]) * 60 + parseFloat(timesEnd[2]);
	    		subtitleObject[currentSubtitleID].endingTime = timeInSecondsEnd;

	    		subtitleObject[currentSubtitleID].text = "";
	    		for (var k = 2; k < 8; k++) { //search for the new subtitle, if the subtitle is more than 5 lines long, I think the subtitle is wrong anyway
	    			if(allSRTlines[i+k] == currentSubtitleID+1){
	    				var linesOfSubtitles = k-3;
	    				for (var z = 0; z < linesOfSubtitles; z++){
	    					subtitleObject[currentSubtitleID].text = subtitleObject[currentSubtitleID].text + allSRTlines[i+2+z];
	    					if(z < linesOfSubtitles - 1){
	    						subtitleObject[currentSubtitleID].text = subtitleObject[currentSubtitleID].text + "\n";
	    					}
	    				}
	    			}
	    		}
	    		currentSubtitleID++
	    	}
	    }//subtitle is fully loaded
	    displaySample(10);
	};
	reader.readAsText(srtFile);
}

function srtToWebVTT(srtFile){
	var reader = new FileReader();
	reader.onload = function(event) {
	    var SRTtext = event.target.result;
	    webVTT = SRTtext.replace(/(\d\d\:\d\d\:\d\d)\,/g, '$1.'); //replace all commas to dots in timestamps
	    webVTT = "WEBVTT FILE \n\n" + webVTT; //add the required WebVTT head

	    console.log("Converted srtToWebVTT");
	    displayWebVTT();
	    return true;
	};
	reader.readAsText(srtFile);
}

function readSRT(input) {
	if (input.files && input.files[0]) {
		var srtFile = input.files[0];
		srtToWebVTT(srtFile); //display the srt as  webvtt without too much hassle of converting it to an object and back
		
		srtToObject(srtFile);
		console.log(subtitleObject);
	}
}

function searchSubtitles(){
	$("#searchResults tr").remove();
	currentSearchWord = $("#searchWord").val().toUpperCase();

	console.log("searching for: "+currentSearchWord);
	var maxAmountOfSubtitles = 15;
	var currentAmountOfSubtitlesShowed = 0;
	for (var i = 1; i < Object.keys(subtitleObject).length; i++){ //loop through all subtitles in file
		
		var fullSubtitle = subtitleObject[i].text.toUpperCase();
		
		if(fullSubtitle.includes(currentSearchWord)){ //contains the searchword
			console.log("Found a subtitle");
			if(currentAmountOfSubtitlesShowed < maxAmountOfSubtitles) {
				var whatToAppend = '<tr><td><a href=# onclick="foundSecondSubtitle(\'' + i + '\');">' + subtitleObject[i].text; + '</a> </td>'
				$('#searchResults').append(whatToAppend);
				currentAmountOfSubtitlesShowed++
			}
		}
	}
}

function displaySample(amount){ //display sample of the subtitle, with amount being how much lines
	$("#headWorking").text("Please select the first subtitle you hear");
	$("#paraWorking").text("");

	$("#searchResults tr").remove();
	for (var i = 1; i < amount+1; i++){
		var whatToAppend = '<tr><td><a href=# onclick="foundFirstSubtitle(\'' + i + '\');">' + subtitleObject[i].text; + '</a> </td>'
		$('#searchResults').append(whatToAppend);
	}
}

function foundFirstSubtitle(subtitleID){
	var selectedSubtitle = subtitleObject[subtitleID];
	console.log(selectedSubtitle);

	$("#searchResults tr").remove();
	$("#paraWorking").html('Please enter the time you heard the subtitle in seconds: <input id="timeHeard" type="number"/> <button id="timeHeardButton" type="button">Fix it!</button>');
	$("#timeHeardButton").click(function(){
		var newTime = $("#timeHeard").val();
		var difference =  newTime - selectedSubtitle.startingTime; //seconds subtitle should be delayed, negative if the subtitle is too late
		console.log(difference);
		delaySubtitle(difference); //delay the subtitles
		objectToWebVTT(); //show fixed subtitles

		$("#headWorking").html('Download or change framerate?');
		$("#paraWorking").html('Is the subtitle now correct ?, to check please skip to the end to the episode. <button id="downloadSRT" type="button">Download SRT</button> <br>'+
			'The subtitle still isnt correct? <button id="changeFramerate" type="button">Change framerate</button>');
		$("#downloadSRT").click(downloadSubtitle);
		$("#changeFramerate").click(changeFramerate);
	});
}

function foundSecondSubtitle(subtitleID){
	var selectedSubtitle = subtitleObject[subtitleID];
	console.log(selectedSubtitle);

	$("#searchResults tr").remove();
	$("#paraWorking").html('Please enter the time you heard the subtitle in hours:minutes:seconds: <input id="timeHeardHours" type="number" style="width: 30px;"/><input id="timeHeardMinutes" type="number" style="width: 35px;"/><input id="timeHeardSeconds" type="number" style="width: 40px;"/> <button id="timeHeardButtonSecond" type="button">Fix it!</button>');
	$("#timeHeardButtonSecond").click(function(){
		var newTimeHours = parseInt($("#timeHeardHours").val(), 10);
		var newTimeMinutes = parseInt($("#timeHeardMinutes").val(), 10);
		var newTimeSeconds = parseFloat($("#timeHeardSeconds").val());

		var newSeconds = newTimeHours * 3600 + newTimeMinutes * 60 + newTimeSeconds;

		console.log(newSeconds);
		var differenceFramerate =  newSeconds / selectedSubtitle.startingTime; //divide the part by the whole to find the change in framerate
		
		console.log(differenceFramerate);
		delaySubtitleFrameRate(differenceFramerate); //delay the subtitles
		objectToWebVTT(); //show fixed subtitles

		$("#headWorking").html('Changed the framerate');
		$("#paraWorking").html('Is the subtitle now correct ?, I don\'t have anymore tricks so download it anyway ;). <button id="downloadSRT" type="button">Download SRT</button>');
		$("#downloadSRT").click(downloadSubtitle);
	});
}

function delaySubtitleFrameRate(delaySpeed) {
	for (var i = 1; i < Object.keys(subtitleObject).length; i++){ //loop through all subtitles in file
		subtitleObject[i].startingTime = subtitleObject[i].startingTime * delaySpeed; //delay the subtitles
		subtitleObject[i].endingTime = subtitleObject[i].endingTime * delaySpeed;
	}
}

function changeFramerate(){
	$("#headWorking").html('Search for a subtitle and enter the time');
	$("#paraWorking").html('Please enter a search keyword and hit enter to search the subtitle file, after finding the correct subtitle please enter the time you here it so the program can determine the proper framerate <br>'+
		'<input id="searchWord" type="text"/>');
	$("#searchWord").change(searchSubtitles);
}

function downloadSubtitle(){
	var SRTtext = webVTTtoSRT(); //get srt from webvtt
	var filename = videoName.replace(".mp4", "") + ".srt"; //always add .srt at the back incase the replacing doesn't work out

	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(SRTtext));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
 	document.body.removeChild(element);
}

function webVTTtoSRT() {
	var SRTtext = webVTT.replace(/(\d\d\:\d\d\:\d\d)\./g, '$1,'); //replace all dots to comma's in timestamps
	SRTtext =  SRTtext.replace("WEBVTT FILE", ""); //remove the required WebVTT head
	return SRTtext
}

function delaySubtitle(amountOfSeconds){
	for (var i = 1; i < Object.keys(subtitleObject).length; i++){ //loop through all subtitles in file
		subtitleObject[i].startingTime = subtitleObject[i].startingTime + amountOfSeconds;
		subtitleObject[i].endingTime = subtitleObject[i].endingTime + amountOfSeconds;
		if(subtitleObject[i].endingTime < 0|| subtitleObject[i].startingTime < 0){ //small check to fix subtitles showing in negative amount of seconds
			subtitleObject[i].endingTime = 1;
			subtitleObject[i].startingTime = 0.1;
		}
	}
}

function displayWebVTT(){
	var webVTTblob = new Blob([webVTT], {
		type: 'text/vtt'
	});
	var webVTTBlobUrl = URL.createObjectURL(webVTTblob);
	$("#subtitle").attr("src", "");
	$("#subtitle").attr("src", webVTTBlobUrl);
	console.log("Display webVTT with url: " + webVTTBlobUrl);
}

function objectToWebVTT(){
	var tempWebVTT = "WEBVTT FILE \n\n";
	for (var i = 1; i < Object.keys(subtitleObject).length; i++){ //loop through all subtitles in file

		tempWebVTT = tempWebVTT + "\n" + 
		subtitleObject[i].id + "\n" + 
		convertSeconds(subtitleObject[i].startingTime) + " --> " + convertSeconds(subtitleObject[i].endingTime) + "\n" +
		subtitleObject[i].text + "\n";
	}
	webVTT = tempWebVTT;
	displayWebVTT();
}

$("#srtInput").change(function(){
	readSRT(this);
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
    videoName = file.name
  }
  var inputNode = document.getElementById('videoInput')
  inputNode.addEventListener('change', playSelectedFile, false)
})()

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}

function convertSeconds (amountOfSeconds, commas) {
    var sec_num = parseFloat(amountOfSeconds); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    var seconds = seconds.toFixed(3); //round seconds to get a nicer format

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}

    var normalFormat = hours+':'+minutes+':'+seconds; //this already uses points, so perfect for WebVTT use
    if(commas == true){
    	return normalFormat.replace(".", ","); //commas for srt format
    } else {
	    return normalFormat;
	}
}
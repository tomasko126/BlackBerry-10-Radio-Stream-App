// Buttons
var playButton = document.getElementsByClassName('playbutton');
var stopButton = document.getElementsByClassName('stopbutton');
var activityIndicator = document.getElementsByClassName('activityindicator');

// Hide yet unused stuff
for (var i=0; i<stopButton.length; i++)
    stopButton[i].style.display = "none";

for (var i=0; i<activityIndicator.length; i++)
    activityIndicator[i].style.display = "none";

// Init variables
var getMetadata = null;        // Function - setInterval() fn, which calls get_song(radio) for updating name of song
var isPlaying = false;          // Bool - If stream is playing, it's given value is true
var readyStateInterval = null;  // Function - setInterval() fn, see line 63 for more info
var stream = null;              // Object - HTML5 Audio object
var streamURL = null;           // String - URL of chosen stream

// HTML5audio object
var html5audio = {
    play: function(radio)
    {
        if (isPlaying) {
            html5audio.resetIcons(radio);
            clearInterval(getMetadata);
        }

        switch (radio) {
            case "expres":
                streamURL = "http://85.248.7.162:8000/96.mp3";
                break;
            case "sro":
                streamURL = "http://live.slovakradio.sk:8000/Slovensko_128.mp3";
                break;
            case "funradio":
                streamURL = "http://stream.funradio.sk:8000/fun128.mp3";
                break;
        }
        // Init chosen radio station
        stream = new Audio(streamURL);

        getMetadata = setInterval(function() {
            get_song(radio);
        }, 5000);

        isPlaying = true;
        stream.play();

        var get = null;
        if (radio === "expres") {
            get = $(playButton[0]).parent();
        } else if (radio === "funradio") {
            get = $(playButton[1]).parent();
        } else if (radio === "sro") {
            get = $(playButton[2]).parent();
        } else {}

        var play = $(get).children()[0];
        var load = $(get).children()[1];
        var stop = $(get).children()[2];


        readyStateInterval = setInterval(function(){
            if (stream.readyState <= 2) {
                play.style.display = 'none';
                load.style.display = 'block';
            }
        }, 1000);

        stream.addEventListener("waiting", function() {
            isPlaying = false;
            play.style.display = 'none';
            stop.style.display = 'none';
            load.style.display = 'block';
        }, false);

        stream.addEventListener("playing", function() {
            isPlaying = true;
            play.style.display = 'none';
            load.style.display = 'none';
            stop.style.display = 'block';
        }, false);

        stream.addEventListener("ended", function() {
            html5audio.stop();
            if (window.confirm('Streaming failed. Possibly due to a network error. Retry?')) {
                html5audio.play(radio);
            }
        }, false);
    },

    pause: function() {
        isPlaying = false;
        clearInterval(readyStateInterval);
        stream.pause();
        stopButton.style.display = 'none';
        activityIndicator.style.display = 'none';
        playButton.style.display = 'block';
    },

    resetIcons: function(radio) {
        stream.pause();

        for (var i=0; i<stopButton.length; i++)
            $(stopButton[i]).css("display","none");

        for (var i=0; i<activityIndicator.length; i++)
            $(activityIndicator[i]).css("display","none");

        for (var i=0; i<playButton.length; i++)
            $(playButton[i]).css("display","block");

        html5audio.stop(radio);
    },

    stop: function(radio) {
        var get = null;
        if (radio === "expres") {
            get = $(playButton[0]).parent();
        } else if (radio === "funradio") {
            get = $(playButton[1]).parent();
        } else if (radio === "sro") {
            get = $(playButton[2]).parent();
        } else {}

        if (radio) {
            var play = $(get).children()[0];
            var load = $(get).children()[1];
            var stop = $(get).children()[2];

            stop.style.display = 'none';
            load.style.display = 'none';
            play.style.display = 'block';
        }

        isPlaying = false;
        clearInterval(readyStateInterval);
        clearInterval(getMetadata);
        if (stream)
            stream.pause();
        stream = null;
    }
};

// Parse stream track info
var get_song = function(station) {
    function reqListener () {
        if (station !== "sro")
            $("#playingsong").html(this.responseText).text();
        else {
            var html = document.implementation.createHTMLDocument('');
            html.documentElement.innerHTML = this.responseText;
            html.querySelector(".ro-slovensko > .playRadio > .overflow > strong").remove();
            $("#playingsong").text(function() {
                var text = html.querySelector(".ro-slovensko > .playRadio > .overflow").textContent;
                return text.replace(/-/,"").replace(" ","");
            });
        }
    }

    var url = "http://tomastaro.sk/parser" + station + ".php";

    var xhr = new XMLHttpRequest();
    xhr.onload = reqListener;
    xhr.open("get", url, true);
    xhr.send();
}
var playButton = document.getElementsByClassName('playbutton');
var stopButton = document.getElementsByClassName('stopbutton');
var activityIndicator = document.getElementsByClassName('activityindicator');
var textPosition = document.getElementById('textposition');

// Hide yet unused stuff
for (var i=0; i<stopButton.length; i++)
    stopButton[i].style.display = "none";

for (var i=0; i<activityIndicator.length; i++)
    activityIndicator[i].style.display = "none";

function onConfirmRetry(button) {
    if (button == 1) {
        html5audio.play();
    }
}

// Update volume
$("#fader").on("input change", function() {
    outputUpdate(this.value);
});

function outputUpdate(vol) {
    switch (vol) {
        case "100": vol = "1"; break;
        case "9": vol = "0.09"; break;
        case "8": vol = "0.08"; break;
        case "7": vol = "0.07"; break;
        case "6": vol = "0.06"; break;
        case "5": vol = "0.05"; break;
        case "4": vol = "0.04"; break;
        case "3": vol = "0.03"; break;
        case "2": vol = "0.02"; break;
        case "1": vol = "0.01"; break;
        default: vol = "0." + vol.toString(); break;
    }
    myaudio.volume = vol;
}

var myaudioURL = "http://85.248.7.162:8000/96.mp3";
var myaudio = new Audio(myaudioURL);

var isPlaying = false;
var readyStateInterval = null;

var html5audio = {
    play: function(radio)
    {
        if (isPlaying)
            html5audio.resetIcons();

        switch (radio) {
            case "expres": myaudioURL = "http://85.248.7.162:8000/96.mp3";
                break;
            case "sro": myaudioURL = "http://85.248.7.162:8000/96.mp3";
                break;
            case "funradio": myaudioURL = "http://stream.funradio.sk:8000/fun128.mp3";
                break;
        }
        // Init radio station
        myaudio = new Audio(myaudioURL);

        // Change played radio station
        $("#playing").text(radio);

        isPlaying = true;
        myaudio.play();

        var get;
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
            if (myaudio.readyState <= 2) {
                play.style.display = 'none';
                load.style.display = 'block';
            }
        },1000);
        myaudio.addEventListener("waiting", function() {
            //console.log('myaudio WAITING');
            isPlaying = false;
            play.style.display = 'none';
            stop.style.display = 'none';
            load.style.display = 'block';
        }, false);
        myaudio.addEventListener("playing", function() {
            isPlaying = true;
            play.style.display = 'none';
            load.style.display = 'none';
            stop.style.display = 'block';
        }, false);
        myaudio.addEventListener("ended", function() {
            html5audio.stop();
            if (window.confirm('Streaming failed. Possibly due to a network error. Retry?')) {
                onConfirmRetry();
            }
        }, false);
    },
    pause: function() {
        isPlaying = false;
        clearInterval(readyStateInterval);
        myaudio.pause();
        stopButton.style.display = 'none';
        activityIndicator.style.display = 'none';
        playButton.style.display = 'block';
    },
    resetIcons: function(radio) {
        myaudio.pause();

        for (var i=0; i<stopButton.length; i++)
            $(stopButton[i]).css("display","none");

        for (var i=0; i<activityIndicator.length; i++)
            $(activityIndicator[i]).css("display","none");

        for (var i=0; i<playButton.length; i++)
            $(playButton[i]).css("display","block");

        html5audio.stop();
    },
    stop: function(radio) {
        var get;
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
        if (myaudio)
            myaudio.pause();
        myaudio = null;
    }
};
// If user clicks on station, begin to play it
$(".radio").click(function() {
    html5audio.play(this.id);
});

// TODO: Create an object for every station
var expres = {
    station_name: "Rádio EXPRES",
    station_description: "Baví nás baviť vás",
    station_icon: "../images/expres.png",
    stream: {
        20: "http://85.248.7.162:8000/20.aac",
        48: "http://85.248.7.162:8000/48.aac",
        64: "http://85.248.7.162:8000/64.mp3",
        96: "http://85.248.7.162:8000/96.mp3"
    }
}

// Init variables
var activityIndicator  = document.getElementById('activityindicator');
var actual_cover_url   = null;
var getMetadata        = null;         // Function - setInterval() fn, which calls get_song(radio) for updating name of song
var isPlaying          = false;          // Bool - If stream is playing, it's given value is true
var readyStateInterval = null;  // Function - setInterval() fn, see line 63 for more info
var stream             = null;              // Object - HTML5 Audio object
var streamURL          = null;           // String - URL of chosen stream
var station            = null;

// HTML5audio object
var html5audio = {
    play: function(radio)
    {
        if (isPlaying) {
            html5audio.reset();
            clearInterval(getMetadata);
        }

        // TODO: Implement switching of quality of stream
        switch (radio) {
            case "expres":
                streamURL = "http://85.248.7.162:8000/96.mp3";
                break;
            case "slovensko":
                streamURL = "http://live.slovakradio.sk:8000/Slovensko_128.mp3";
                break;
            case "funradio":
                streamURL = "http://stream.funradio.sk:8000/fun128.mp3";
                break;
        }
        // Init chosen radio station
        stream = new Audio(streamURL);
        station = radio;

        get_song(radio);

        getMetadata = setInterval(function() {
            get_song(radio);
        }, 30000);

        isPlaying = true;
        stream.play();

        readyStateInterval = setInterval(function(){
            if (stream.readyState && stream.readyState <= 2) {
                isPlaying = true;
                activityIndicator.style.display = 'block';
            }
        }, 1000);

        stream.addEventListener("waiting", function() {
            isPlaying = false;
            activityIndicator.style.display = 'block';
        }, false);

        stream.addEventListener("playing", function() {
            isPlaying = true;
            activityIndicator.style.display = 'none';
        }, false);

        stream.addEventListener("ended", function() {
            html5audio.stop();
            if (window.confirm('Streaming failed. Possibly due to a network error. Retry?')) {
                html5audio.play(radio);
            }
        }, false);
    },

    reset: function() {
        activityIndicator.style.display = 'none';
        stream.pause();
        html5audio.stop();
    },

    stop: function() {
        activityIndicator.style.display = 'none';
        clearInterval(readyStateInterval);
        clearInterval(getMetadata);
        isPlaying = false;
        if (stream)
            stream.pause();
        stream = null;
    }
};

// Parse stream track info
var get_song = function(station) {
    function reqListener () {
        if (station !== "slovensko") {
            var artist_song = null;
            if (station === "expres")
                artist_song = this.responseText.split(":");
            else
                artist_song = this.responseText.split("-");

            if (artist_song[0] && !artist_song[1]) {
                $("#artist").text(artist_song[0]);
                $("#song").text("");
            } else if (!artist_song[0] && artist_song[1]) {
                $("#artist").text("");
                $("#song").text(artist_song[1]);
            } else {
                $("#artist").html(artist_song[0]).text();
                $("#song").html(artist_song[1]).text();
            }

            // LAST.FM API for getting cover of song
            if (artist_song[0] && artist_song[1]) {
                $.ajax({
                    type: "POST",
                    url: "http://ws.audioscrobbler.com/2.0/?",
                    data: { method: "track.getInfo", api_key: "cdfa596938a9f8083739ee5ee08e7e29",
                           artist: artist_song[0], track: artist_song[1] },
                    success: function(response) {

                        if (response.querySelector("image")) {
                            var cover_url = response.querySelector("image").textContent;
                        } else {
                            $("#artist").html(artist_song[0]).text();
                            $("#song").html(artist_song[1]).text();
                        }

                        // We already got url of image -> it means that callback was successful,
                        // so add image to playing div
                        if (cover_url && actual_cover_url !== cover_url) {
                            if (document.querySelector("#status > img")) {
                                document.querySelector("#status > img").src = cover_url;

                            } else {
                                $('<img src="' + cover_url + '">').load(function() {
                                    $(this).insertBefore('#playing').addClass("radioimg");
                                });
                            }
                            actual_cover_url = cover_url;
                        } else if (!cover_url) {
                            if (!document.querySelector("#status > img")) {
                                $('<img src="images/' + station + '.png">').load(function() {
                                    $(this).insertBefore('#playing').addClass("radioimg");
                                });
                            } else {
                                document.querySelector("#status > img").src = "images/" + station + ".png";
                            }
                            actual_cover_url = cover_url;
                        } else {}
                    },
                    error: function(status) {
                        // Replace image with station image, when error occurs
                        if (!document.querySelector("#status > img")) {
                            $('<img src="images/' + station + '.png">').load(function() {
                                $(this).insertBefore('#playing').addClass("radioimg");
                            });
                        } else {
                            document.querySelector("#status > img").src = "images/" + station +".png";
                        }
                    }
                });
            } else {
                // If we don't know either name of artist or song, replace img with station img
                if (!document.querySelector("#status > img")) {
                    $('<img src="images/' + station + '.png">').load(function() {
                        $(this).insertBefore('#playing').addClass("radioimg");
                    });
                } else {
                    document.querySelector("#status > img").src = "images/" + station +".png";
                }
            }
        } else {
            // Specific handling of Rádio Slovensko station
            var html = document.implementation.createHTMLDocument('');
            html.documentElement.innerHTML = this.responseText;
            html.querySelector(".ro-slovensko > .playRadio > .overflow > strong").remove();
            $("#song").text(function() {
                var text = html.querySelector(".ro-slovensko > .playRadio > .overflow").textContent;
                return text.replace(/-/,"").replace(" ","");
            });

            if (!document.querySelector("#status > img")) {
                $('<img src="images/slovensko.png">').load(function() {
                    $(this).insertBefore('#playing').addClass("radioimg");
                });
            } else {
                document.querySelector("#status > img").src = "images/slovensko.png";
            }

            $("#artist").text("Rádio Slovensko");
        }
        if ($(".marquee").text().length > 20)
            $(".marquee").marquee();
    }

    var url = "http://tomastaro.sk/parser" + station + ".php";

    var xhr = new XMLHttpRequest();
    xhr.onload = reqListener;
    xhr.open("get", url, true);
    xhr.send();
}
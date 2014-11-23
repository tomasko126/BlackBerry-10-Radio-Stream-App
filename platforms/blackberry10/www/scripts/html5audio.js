// TODO: Create an object for every station, low-priority atm
var expres = {
    stationName: "Rádio EXPRES",
    stationDescription: "Baví nás baviť vás",
    stationIcon: "../images/expres.png",
    stream: {
        20: "http://85.248.7.162:8000/20.aac",
        48: "http://85.248.7.162:8000/48.aac",
        64: "http://85.248.7.162:8000/64.mp3",
        96: "http://85.248.7.162:8000/96.mp3"
    }
}

// Init variables
var actualCoverUrl     = null;         // String   - URL of cover
var getMetadata        = null;         // Function - setInterval() fn, which calls getName(radio) for updating name of song
var isPlaying          = false;        // Bool     - If stream is playing, it's given value is true
var songMetadata       = null;         // Array    - Contains name of artist and name of song
var stream             = null;         // Object   - HTML5 Audio object
var streamUrl          = null;         // String   - URL of chosen radio stream
var station            = null;         // String   - name of playing radio stream

// HTML5audio object
var html5audio = {
    play: function(radio)
    {
        isPlaying = true;

        if (stream) {
            $("#artist").removeClass('animated fadeIn');
            $("#song").removeClass('animated fadeIn');
            html5audio.stop();
        }

        // TODO: Implement switching of quality of stream
        // Choose a radio station
        switch (radio) {
            case "expres":
                streamUrl = "http://85.248.7.162:8000/96.mp3";
                break;
            case "slovensko":
                streamUrl = "http://live.slovakradio.sk:8000/Slovensko_128.mp3";
                break;
            case "funradio":
                streamUrl = "http://stream.funradio.sk:8000/fun128.mp3";
                break;
            case "europa2":
                streamUrl = "http://ice2.europa2.sk/fm-europa2sk-128";
                break;
            case "jemne":
                streamUrl = "http://93.184.69.143:8000/;jemnemelodie-high-mp3.mp3";
                break;
        }

        // Init chosen radio station
        stream = new Audio(streamUrl);
        station = radio;

        getName(radio);

        getMetadata = setInterval(function() {
            getName(radio);
        }, 15000);

        stream.play();

        stream.addEventListener("waiting", function() {
            isPlaying = false;
            document.getElementById('activityindicator').style.display = 'block';
        }, false);

        stream.addEventListener("playing", function() {
            isPlaying = true;
            document.getElementById('activityindicator').style.display = 'none';
        }, false);

        stream.addEventListener("ended", function() {
            html5audio.stop();
            if (window.confirm('Streaming failed. Possibly due to a network error. Retry?')) {
                html5audio.play(station);
            }
        }, false);
    },
    stop: function() {
        stream.pause();
        document.getElementById('activityindicator').style.display = 'none';
        clearInterval(getMetadata);
        stream = null;
        isPlaying = false;
        actualCoverUrl = null;
    }
};

// Parse stream track info
// TODO: Don't call getCover() for Expres, Europa 2, Evropa 2 & Frekvence 1,
//       because cover of track is already included in json callback
var getName = function(station) {
    function reqListener () {
        if (station !== "slovensko" && station !== "europa2") {
            var metadata = null;

            if (station === "funradio") {
                metadata = [];
                metadata.push($(this.responseText).find("interpret")[0].textContent);
                metadata.push($(this.responseText).find("skladba")[0].textContent);
                songMetadata = [metadata[0], metadata[1]];
            }

            if (station === "expres") {
                var json = JSON.parse(this.responseText);
                metadata = [json.stream.artist, json.stream.song];
                songMetadata = [metadata[0], metadata[1]];
            }

            if (station === "jemne") {
                var html = document.implementation.createHTMLDocument('');
                html.documentElement.innerHTML = this.responseText;
                var text = html.getElementsByTagName("body")[0].innerText;
                var info = text.replace(/[0-9]/g, "").replace(/,/g,"").split("-");
                metadata = [info[0], info[1]];
                songMetadata = [metadata[0], metadata[1]];
            }

            if (metadata[0] && !metadata[1]) {
                $("#artist").addClass('animated fadeIn').text(metadata[0]);
                $("#song").text("");
            } else if (!metadata[0] && metadata[1]) {
                $("#artist").text("");
                $("#song").addClass('animated fadeIn').text(metadata[1]);
            } else if (metadata[0] && metadata[1]) {
                $("#artist").addClass('animated fadeIn').html(metadata[0]).text();
                $("#song").addClass('animated fadeIn').html(metadata[1]).text();
            } else {
                if (station === "jemne") {
                    $("#artist").text("Rádio Jemné");
                    $("#song").text("Pohodová muzika");
                }
            }

            // LAST.FM API for getting cover of song
            if (metadata[0] && metadata[1]) {
                getCover(metadata[0], metadata[1]);
                songMetadata = [metadata[0], metadata[1]];
            } else {
                // If we don't know either name of artist or song, replace img with station img
                if (!document.querySelector("#status > img")) {
                    $('<img src="images/' + station + '.png">').load(function() {
                        $(this).insertBefore('#playing').addClass("radioimg animated fadeIn");
                    });
                } else {
                    $("#status > img").addClass("animated fadeIn");
                    document.querySelector("#status > img").src = "images/" + station +".png";
                }
            }
            if (metadata && metadata[0] && metadata[1])
                marquee();
        } else {
            if (station === "slovensko") {
                var html = document.implementation.createHTMLDocument('');
                html.documentElement.innerHTML = this.responseText;
                html.querySelector(".ro-slovensko > .playRadio > .overflow > strong").remove();
                $("#artist").addClass('animated fadeIn').text("Rádio Slovensko");
                $("#song").addClass('animated fadeIn').text(function() {
                    var text = html.querySelector(".ro-slovensko > .playRadio > .overflow").textContent;
                    return text.replace(/-/,"").replace(" ","");
                });
            } else {
                // TODO: The same for Evropa 2, Frekvence 1
                $.get("http://rds.lagardere.cz/getRadio.php?station=okey", function(data) {
                    var artist = data.querySelector("songArtist").textContent.
                    replace(/^\s*\/\/<!\[CDATA\[([\s\S]*)\/\/\]\]>\s*\z/,"");
                    var song = data.querySelector("songTitle").textContent.
                    replace(/^\s*\/\/<!\[CDATA\[([\s\S]*)\/\/\]\]>\s*\z/,"");

                    if (artist && song) {
                        getCover(artist, song);
                        songMetadata = [artist, song];
                        marquee();
                    }

                    $("#artist").addClass('animated fadeIn').text(function() {
                        return artist;
                    });

                    $("#song").addClass('animated fadeIn').text(function() {
                        return song;
                    });
                });
            }

            if (!actualCoverUrl) {
                if (!document.querySelector("#status > img")) {
                    $('<img src="images/' + station + '.png">').load(function() {
                        $(this).insertBefore('#playing').addClass("radioimg animated fadeIn");
                    });
                } else {
                    $("#status > img").addClass("animated fadeIn");
                    document.querySelector("#status > img").src = "images/" + station +".png";
                }
            }
        }
    }

    if (station) {
        var url = "http://tomastaro.sk/parser" + station + ".php";

        var xhr = new XMLHttpRequest();
        xhr.onload = reqListener;
        xhr.open("get", url, true);
        xhr.send();
    }
}

function getCover(artist, track) {
    $.ajax({
        type: "POST",
        url: "http://ws.audioscrobbler.com/2.0/?",
        data: { method: "track.getInfo", api_key: "cdfa596938a9f8083739ee5ee08e7e29",
               artist: artist, track: track },
        success: function(response) {
            if (response.querySelector("image")) {
                var cover_url = response.querySelector("image").textContent;
            } else {
                $("#artist").addClass('animated fadeIn').html(artist).text();
                $("#song").addClass('animated fadeIn').html(track).text();
            }

            // We already got url of image -> it means that callback was successful,
            // so add image to playing div
            if (cover_url && actualCoverUrl !== cover_url) {
                if (document.querySelector("#status > img")) {
                    $("#status > img").addClass("animated fadeIn");
                    document.querySelector("#status > img").src = cover_url;
                } else {
                    $('<img src="' + cover_url + '">').load(function() {
                        $(this).insertBefore('#playing').addClass("radioimg animated fadeIn");
                    });
                }
                actualCoverUrl = cover_url;
            } else if (!cover_url) {
                if (!document.querySelector("#status > img")) {
                    $('<img src="images/' + station + '.png">').load(function() {
                        $(this).insertBefore('#playing').addClass("radioimg animated fadeIn");
                    });
                } else {
                    $("#status > img").addClass("animated fadeIn");
                    document.querySelector("#status > img").src = "images/" + station + ".png";
                }
                actualCoverUrl = cover_url;
            } else {}
        },
        error: function(status) {
            // Replace image with station image, when error occurs
            if (!document.querySelector("#status > img")) {
                $('<img src="images/' + station + '.png">').load(function() {
                    $(this).insertBefore('#playing').addClass("radioimg animated fadeIn");
                });
            } else {
                $("#status > img").addClass("animated fadeIn");
                document.querySelector("#status > img").src = "images/" + station +".png";
            }
        }
    });
}

function marquee() {
    setTimeout(function() {
    if (songMetadata[0].length > 20)
        $("#artist").marquee();

    if (songMetadata[1].length > 20)
        $("#song").marquee();
    }, 50);
}
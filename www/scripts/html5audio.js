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
var actual_cover_url   = null;
var getMetadata        = null;         // Function - setInterval() fn, which calls get_song(radio) for updating name of song
var isPlaying          = false;        // Bool - If stream is playing, it's given value is true
var readyStateInterval = null;         // Function - setInterval() fn, see line 63 for more info
var stream             = null;         // Object - HTML5 Audio object
var streamURL          = null;         // String - URL of chosen stream
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
            case "europa2":
                streamURL = "http://ice2.europa2.sk/fm-europa2sk-128";
                break;
            case "jemne":
                streamURL = "http://93.184.69.143:8000/;jemnemelodie-high-mp3.mp3";
                break;
        }
        // Init chosen radio station
        stream = new Audio(streamURL);
        station = radio;

        get_song(radio);

        getMetadata = setInterval(function() {
            get_song(radio);
        }, 15000);

        isPlaying = true;
        stream.play();

        readyStateInterval = setInterval(function(){
            if (stream.readyState && stream.readyState <= 2) {
                isPlaying = true;
                console.log(document.getElementById('activityindicator'));
                document.getElementById('activityindicator').style.display = 'block';
            }
        }, 1000);

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

    reset: function() {
        document.getElementById('activityindicator').style.display = 'none';
        stream.pause();
        html5audio.stop();
    },

    stop: function() {
        document.getElementById('activityindicator').style.display = 'none';
        clearInterval(readyStateInterval);
        clearInterval(getMetadata);
        isPlaying = false;
        if (stream)
            stream.pause();
        stream = null;
        actual_cover_url = null;
    }
};

// Parse stream track info
// TODO: Don't call ajaxCover() for Expres, Europa 2, Evropa 2 & Frekvence 1,
//       because cover of track is already included in json callback
var get_song = function(station) {
    function reqListener () {
        if (station !== "slovensko" && station !== "europa2") {
            var artist_song = null;

            if (station === "funradio") {
                artist_song = [];
                artist_song.push($(this.responseText).find("interpret")[0].textContent);
                artist_song.push($(this.responseText).find("skladba")[0].textContent);
            }

            if (station === "expres") {
                var json = JSON.parse(this.responseText);
                artist_song = [json.stream.artist, json.stream.song];
            }

            if (station === "jemne") {
                var html = document.implementation.createHTMLDocument('');
                html.documentElement.innerHTML = this.responseText;
                var text = html.getElementsByTagName("body")[0].innerText;
                var info = text.replace(/[0-9]/g, "").replace(/,/g,"").split("-");
                artist_song = [info[0], info[1]];
            }

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
                ajaxCover(artist_song[0], artist_song[1]);

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
            if (station === "slovensko") {
                // Specific handling of Rádio Slovensko station
                var html = document.implementation.createHTMLDocument('');
                html.documentElement.innerHTML = this.responseText;
                html.querySelector(".ro-slovensko > .playRadio > .overflow > strong").remove();
                $("#song").text(function() {
                    var text = html.querySelector(".ro-slovensko > .playRadio > .overflow").textContent;
                    return text.replace(/-/,"").replace(" ","");
                });

                $("#artist").text("Rádio Slovensko");
            } else {
                // TODO: The same for Evropa 2, Frekvence 1
                $.get("http://rds.lagardere.cz/getRadio.php?station=okey", function(data) {
                    var artist = data.querySelector("songArtist").textContent.
                    replace(/^\s*\/\/<!\[CDATA\[([\s\S]*)\/\/\]\]>\s*\z/,"");
                    var song = data.querySelector("songTitle").textContent.
                    replace(/^\s*\/\/<!\[CDATA\[([\s\S]*)\/\/\]\]>\s*\z/,"");

                    if (artist && song)
                        ajaxCover(artist, song);

                    $("#artist").text(function() {
                        return artist;
                    });

                    $("#song").text(function() {
                        return song;
                    });
                });
            }

            if (!document.querySelector("#status > img")) {
                $('<img src="images/' + station + '.png">').load(function() {
                    $(this).insertBefore('#playing').addClass("radioimg");
                });
            } else {
                document.querySelector("#status > img").src = "images/" + station +".png";
            }

            if ($(".marquee").text().length > 20)
                $(".marquee").marquee();
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

function ajaxCover(artist, track) {
    $.ajax({
        type: "POST",
        url: "http://ws.audioscrobbler.com/2.0/?",
        data: { method: "track.getInfo", api_key: "cdfa596938a9f8083739ee5ee08e7e29",
               artist: artist, track: track },
        success: function(response) {

            if (response.querySelector("image")) {
                var cover_url = response.querySelector("image").textContent;
            } else {
                $("#artist").html(artist).text();
                $("#song").html(track).text();
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
}
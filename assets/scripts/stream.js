// Init variables
var actualCoverUrl     = null;         // String   - URL of cover
var getMetadata        = null;         // Function - setInterval() fn, which calls getName(radio) for updating name of song
var songMetadata       = null;         // Array    - Contains name of artist and name of song
var station            = null;         // String   - name of playing radio stream
var timeoutID          = null;

// Message from Cascade
navigator.cascades.onmessage = function onmessage(message) {
    if (message === "expres" || message === "funradio" || message === "slovensko" ||
        message === "europa2" || message === "jemne") {
        stream.play(message);
        return;
    }
    // If play button has been pressed
    if (message === "play") {
        if (station) {
            stream.play(station);
        } else {
            // TODO: display a popup, what station to play?
            stream.play("expres");
        }
        return;
    }
    // If stop button has been pressed
    if (message === "stop") {
        stream.stop();
        return;
    }
    // When station couldn't be fetched
    if (message === "error") {
        stream.stop();
        if (window.confirm('Streaming failed, possibly due to a network error. Retry?')) {
            stream.play(station);
        }
    }
    if (message === "showLoading") {
        document.getElementById('activityindicator').style.display = 'inline';
    }
    if (message === "hideLoading") {
        document.getElementById('activityindicator').style.display = 'none';
    }
    // Timer
    if (parseInt(message)) {
        if (timeoutID) {
            window.clearTimeout(timeoutID);
            timeoutID = window.setTimeout(function() {
                stream.stop();
            }, message);
        } else {
            timeoutID = window.setTimeout(function() {
                stream.stop();
                window.clearTimeout(timeoutID);
            }, message);
        }
    }
}

// Player object
var stream = {
    play: function(radio) {
        // If stream is playing, stop it first
        if (station) {
            $("#artist").removeClass('animated fadeIn');
            $("#song").removeClass('animated fadeIn');
            this.stop();
        }

        // Get url of chosen radio station and begin to load it
        this.init(radio);
    },
    getCover: function(artist, track) {
        $.ajax({
            type: "POST",
            url: "http://ws.audioscrobbler.com/2.0/?",
            data: { method: "track.getInfo", api_key: "cdfa596938a9f8083739ee5ee08e7e29",
                   artist: artist, track: track },
            success: function(response) {
                var a = response.querySelectorAll("image");
                var b = a.length;
                a = a[b-1];
                if (a) {
                    // We've got URL of cover
                    var cover_url = a.textContent;
                } else {
                    $("#artist").addClass('animated fadeIn').html(artist).text();
                    $("#song").addClass('animated fadeIn').html(track).text();
                }

                // We already got url of image in response -> add cover image
                if (cover_url && actualCoverUrl !== cover_url) {
                    if (document.querySelector("#status > img")) {
                        $("#status > img").addClass("animated fadeIn");
                        document.querySelector("#status > img").src = cover_url;
                    } else {
                        $('<img src="' + cover_url + '">').load(function() {
                            $(this).addClass("radioimg animated fadeIn").insertBefore('#playing');
                        });
                    }
                    actualCoverUrl = cover_url;
                    // We didn't get URL of cover in response -> add default station omage
                } else if (!cover_url) {
                    if (!document.querySelector("#status > img")) {
                        $('<img src="images/' + station + '.png">').load(function() {
                            $(this).addClass("radioimg animated fadeIn").insertBefore('#playing');
                        });
                    } else {
                        $("#status > img").addClass("animated fadeIn");
                        document.querySelector("#status > img").src = "images/" + station + ".png";
                    }
                    actualCoverUrl = cover_url;
                }
            },
            error: function(status) {
                // An error has been thrown, add station image
                if (!document.querySelector("#status > img")) {
                    $('<img src="images/' + station + '.png">').load(function() {
                        $(this).addClass("radioimg animated fadeIn").insertBefore('#playing');
                    });
                } else {
                    $("#status > img").addClass("animated fadeIn");
                    document.querySelector("#status > img").src = "images/" + station +".png";
                }
            }
        });
    },
    // Parse stream track info
    // TODO: Don't call getCover() for Expres, Europa 2, Evropa 2 & Frekvence 1,
    //       because cover of track is already included in json callback,
    //       this needs specific handling
    getName: function(station) {
        function reqListener () {
            // Handle SRO & Europa 2 specifically
            if (station !== "slovensko" && station !== "europa2") {

                if (station === "expres") {
                    var json = JSON.parse(this.responseText);
                    songMetadata = [json.stream.artist, json.stream.song];
                }

                if (station === "funradio") {
                    var artist = $(this.responseText).find("interpret")[0].textContent;
                    var song = $(this.responseText).find("skladba")[0].textContent;
                    songMetadata = [artist, song];
                }

                // Don't handle Jemné station (gives us data very rarely)
                if (station === "jemne") {
                    songMetadata = ["Rádio Jemné", "Pohodová muzika"];
                }

                if (songMetadata[0] && !songMetadata[1]) {
                    $("#artist").addClass('animated fadeIn').text(songMetadata[0]);
                    $("#song").text("");
                } else if (!songMetadata[0] && songMetadata[1]) {
                    $("#artist").text("");
                    $("#song").addClass('animated fadeIn').text(songMetadata[1]);
                } else if (songMetadata[0] && songMetadata[1]) {
                    $("#artist").addClass('animated fadeIn').html(songMetadata[0]).text();
                    $("#song").addClass('animated fadeIn').html(songMetadata[1]).text();
                }

                // LAST.FM API for getting cover of song
                if (station !== "jemne" && songMetadata[0] && songMetadata[1]) {
                    stream.getCover(songMetadata[0], songMetadata[1]);
                } else {
                    // If we don't know either name of artist or song, replace img with station img
                    if (!document.querySelector("#status > img")) {
                        $('<img src="images/' + station + '.png">').load(function() {
                            $(this).addClass("radioimg animated fadeIn").insertBefore('#playing');
                        });
                    } else {
                        $("#status > img").addClass("animated fadeIn");
                        document.querySelector("#status > img").src = "images/" + station +".png";
                    }
                }
                // Marquee name of artist and song
                if (songMetadata && songMetadata[0] && songMetadata[1]) {
                    if (songMetadata[0] === $("#artist").text() ||
                        songMetadata[1] === $("#song").text())
                        return;
                    marquee();
                }
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

                    // TODO: Marquee

                } else {
                    // TODO: The same for Evropa 2, Frekvence 1 -- just replace 'okey' in GET
                    $.get("http://rds.lagardere.cz/getRadio.php?station=okey", function(data) {
                        var artist = data.querySelector("songArtist").textContent.
                        replace(/^\s*\/\/<!\[CDATA\[([\s\S]*)\/\/\]\]>\s*\z/,"");
                        var song = data.querySelector("songTitle").textContent.
                        replace(/^\s*\/\/<!\[CDATA\[([\s\S]*)\/\/\]\]>\s*\z/,"");

                        $("#artist").addClass('animated fadeIn').text(function() {
                            return artist;
                        });

                        $("#song").addClass('animated fadeIn').text(function() {
                            return song;
                        });

                        if (artist && song) {
                            stream.getCover(artist, song);
                            songMetadata = [artist, song];
                            if (artist === $("#artist").text() ||
                                song === $("#song").text())
                                return;
                            marquee();
                        }
                    });
                }

                // TODO: A possible bug here?
                if (!actualCoverUrl) {
                    if (!document.querySelector("#status > img")) {
                        $('<img src="images/' + station + '.png">').load(function() {
                            $(this).addClass("radioimg animated fadeIn").insertBefore('#playing');
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
            xhr.open("GET", url, true);
            xhr.send();
        }
    },
    init: function(radio) {
        // Save name of currently playing radio
        station = radio;

        // Get name of artist and track
        this.getName(radio);

        // Get name of artist and track each 15 seconds
        getMetadata = setInterval(function() {
            stream.getName(radio);
        }, 15000);
    },
    stop: function() {
        document.getElementById('activityindicator').style.display = 'none';
        clearInterval(getMetadata);
        actualCoverUrl = null;
    }
};

function marquee() {
    setTimeout(function() {
        // TODO: Make a better logic...maybe get a resolution?
        // BUG: Doesn't work on funradio station & europa2
        if (songMetadata[0].length > 20)
            $("#artist").marquee({
                duration: 5000,
                gap: 250,
                delayBeforeStart: 0,
                direction: 'left',
                duplicated: true
            });

        if (songMetadata[1].length > 20)
            $("#song").marquee({
                duration: 5000,
                gap: 250,
                delayBeforeStart: 0,
                direction: 'left',
                duplicated: true
            });
    }, 500);
}
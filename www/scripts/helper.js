// If user clicks on station, begin to play it
$(".radio").click(function() {
    html5audio.play(this.id);
});

// Fetch metadata for currently playing track
if (actualCoverUrl && isPlaying) {
    $('<img src="' + actualCoverUrl + '">').load(function() {
        $(this).insertBefore('#playing').addClass("radioimg");
    });
}

if (station) {
    getName(station);
}
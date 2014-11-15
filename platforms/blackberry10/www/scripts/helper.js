// If user clicks on station, begin to play it
$(".radio").click(function() {
    html5audio.play(this.id);
});

// Fetch metadata for currently playing track
if (isPlaying) {
    if (actualCoverUrl) {
        $('<img src="' + actualCoverUrl + '">').load(function() {
            $(this).insertBefore('#playing').addClass("radioimg");
        });
    } else {
        $('<img src="images/' + station + '.png">').load(function() {
            $(this).insertBefore('#playing').addClass("radioimg");
        });
    }
}

if (songMetadata && isPlaying) {
    $("#artist").text(songMetadata[0]);
    $("#song").text(songMetadata[1]);
}
// If user clicks on station, begin to play it
$(".radio").click(function() {
    html5audio.play(this.id);
});

// Fetch metadata for currently playing track
if (actual_cover_url) {
    $('<img src="' + actual_cover_url + '">').load(function() {
        $(this).insertBefore('#playing').addClass("radioimg");
    });
}

if (station) {
    get_song(station);
}
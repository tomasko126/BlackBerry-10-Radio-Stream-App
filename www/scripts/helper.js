// If user clicks on station, begin to play it
$(".radio").click(function() {
    html5audio.play(this.id);
});

get_song(station);

if (actual_cover_url) {
    $('<img src="' + actual_cover_url + '">').load(function() {
        $(this).insertBefore('#playing').addClass("radioimg");
    });
}
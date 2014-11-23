// If user clicks on station, begin to play it
$(".radio").click(function() {
    html5audio.play(this.id);
});

$('#body').css("display","block").addClass('animated zoomIn');

// Fetch metadata for currently playing track
if (songMetadata && isPlaying) {
    $("#artist").addClass('animated fadeIn').text(songMetadata[0]);
    $("#song").addClass('animated fadeIn').text(songMetadata[1]);
    marquee();
}
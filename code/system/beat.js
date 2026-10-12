function beatgenerator(time, musicname) {
    var frame = RhythmEngine.sample({
        time: time,
        segments: rythms[musicname],
        volume: music[musicname].volume(),
        preflashRange: settings.preflashrange,
        cueState: soundbeat,
        playCue: function playRhythmCue(name) {
			if (name==='level1-accent'
				&& typeof playLevelOneAccent==='function'){
				playLevelOneAccent(time);
				return;
			}
            sfx.play(name);
        },
    });

    beat = frame.beat;
    prebeat = frame.prebeat;
    prebeat2 = frame.prebeat2;
}

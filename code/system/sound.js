if (settings.version=='demo'){
	var nmusicloadmax=8;

}
else if (settings.version=='test'){
	var nmusicloadmax=6; //basis
	if (settings.playtest.includes(1)){
		nmusicloadmax+=2;
	}
	if (settings.playtest.includes(2)){
		nmusicloadmax+=2;
	}
	if (settings.playtest.includes(3)){
		nmusicloadmax+=2;

	}
	if (settings.playtest.includes(4)){
		nmusicloadmax+=1;

	}
	if (settings.playtest.includes(5)){
		nmusicloadmax+=3;

	}


}
else{
	var nmusicloadmax=16;
}
var volume=[];
			volume['master']=1;
			volume['music']=0.8;
			volume['sfx']=0.4;
			volume['other']=1;
			
			var music = [];
			var effects = [];
			var other = [];
			var playing; //pointer to current music audio
			var levelOneAccent;
			var levelOneAccentNames=[];
			var levelOneAccentSprite={};

			for (var levelOneAccentIndex=0; levelOneAccentIndex<16; levelOneAccentIndex++){
				var levelOneAccentNumber=levelOneAccentIndex+1;
				var levelOneAccentName='forest-accent-'
					+ (levelOneAccentNumber<10 ? '0' : '')
					+ levelOneAccentNumber;
				levelOneAccentNames.push(levelOneAccentName);
				levelOneAccentSprite[levelOneAccentName]=[
					100+levelOneAccentIndex*450,
					360,
				];
			}

			function playLevelOneAccent(time){
				if (!levelOneAccent){return;}

				// Choose from the music cursor instead of random state. Replays and
				// seeks therefore always return to the same variation for each bar.
				var cueIndex=Math.round((Number(time)-0.611)/1.632);
				var variationIndex=(
					(cueIndex%levelOneAccentNames.length)
					+levelOneAccentNames.length
				)%levelOneAccentNames.length;
				levelOneAccent.play(levelOneAccentNames[variationIndex]);
			}

	var sfx = webDemoHowl({
				
  src: [
    "sounds/sfx.mp3",
  ],
  onload: function () {nmusicloaded++;},
  volume: 0.4,

});

//sfx_stars
//sfx_combo
//sfx_hit

//usage:
(readTextFile(webDemoAssetUrl("sounds/sfx.json"), function(text){
    var resp = JSON.parse(text);
    sfx._sprite = resp.sprite;
}));


	function loadsound(name, layer, stop=false, codec='mp3')
	{
		if (stop){
			return webDemoHowl({
				src: ['sounds/music0'+layer+'/'+name+'.'+codec, 'sounds/music0'+layer+'/'+name+'.mp3', 'sounds/'+layer+'/'+name+'.wav'],
				volume: volume[layer],
				onload: function () {nmusicloaded++;},
				onfade: function () {this.stop();},
			});
		}
		else{
			return webDemoHowl({
				src: ['sounds/music0'+layer+'/'+name+'.'+codec, 'sounds/music0'+layer+'/'+name+'.mp3', 'sounds/'+layer+'/'+name+'.wav'],
				volume: volume[layer],
				onload: function () {nmusicloaded++;},
			});
		}
	}


      music['nowloading']=loadsound('nowloading', 0);
	  music['tutorial']=loadsound('tutorial', 0);
      music['ending']=loadsound('ending', 0);
      music['gameover']=loadsound('gameover', 0);
	  music['scarybeat']=loadsound('scarybeat', 0, true);
	  
	  //stage 1
	  if (settings.version!=='test' || settings.playtest.includes(1))
		{
	  music['greengrass']=loadsound('greengrass', 1);
	  levelOneAccent = webDemoHowl({
		  src: ['sounds/music01/level1-beats.wav'],
		  sprite: levelOneAccentSprite,
		  volume: 0.78,
		  onload: function () {nmusicloaded++;},
	  });
		}

	  //stage 2
	  if (settings.version!=='demo' && (settings.version!=='test' || settings.playtest.includes(2)))
		{
      music['spacespeed']=loadsound('spacespeed', 2);
      music['alien']=loadsound('alien', 2);
		}

	  //stage 4
	  if (settings.version!=='demo' && (settings.version!=='test' || settings.playtest.includes(4)))
		{
      music['freeflight']=loadsound('freeflight', 4);
		}

	  //stage 4
	  if (settings.version!=='demo' && (settings.version!=='test' || settings.playtest.includes(3)))
		{
      music['cokecity']=loadsound('cokecity', 3);
      music['jamesbond']=loadsound('jamesbond', 3);
		}

	  //stage 5
	  if (settings.version!=='demo' && (settings.version!=='test' || settings.playtest.includes(5)))
		{
      music['blendedbrain']=loadsound('blendedbrain', 5);
      music['face1']=loadsound('face1', 5);
      music['face2']=loadsound('face2', 5);
		}
		

			if (typeof Function.prototype.bind != 'function') {
			  Function.prototype.bind = (function () {
			    var slice = Array.prototype.slice;
			    return function (thisArg) {
			      var target = this, boundArgs = slice.call(arguments, 1);
			 
			      if (typeof target != 'function') throw new TypeError();
			 
			      function bound() {
				var args = boundArgs.concat(slice.call(arguments));
				target.apply(this instanceof bound ? this : thisArg, args);
			      }
			 
			      bound.prototype = (function F(proto) {
			          proto && (F.prototype = proto);
			          if (!(this instanceof F)) return new F;          
				})(target.prototype);
			 
			      return bound;
			    };
			  })();
			}

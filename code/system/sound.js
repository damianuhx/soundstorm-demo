if (settings.version=='demo'){
	var nmusicloadmax=7;

}
else{
	var nmusicloadmax=15;
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

	var sfx = new Howl({
				
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
(readTextFile("sounds/sfx.json", function(text){
    var resp = JSON.parse(text);
    sfx._sprite = resp.sprite;
}));


	function loadsound(name, layer, stop=false, codec='mp3')
	{
		if (stop){
			return new Howl({
				src: ['sounds/music0'+layer+'/'+name+'.'+codec, 'sounds/music0'+layer+'/'+name+'.mp3', 'sounds/'+layer+'/'+name+'.wav'],
				volume: volume[layer],
				onload: function () {nmusicloaded++;},
				onfade: function () {this.stop();},
			});
		}
		else{
			return new Howl({
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
	  
	  music['greengrass']=loadsound('greengrass', 1);

	  

      music['spacespeed']=loadsound('spacespeed', 2);
      music['alien']=loadsound('alien', 2);
      music['freeflight']=loadsound('freeflight', 4);
      music['cokecity']=loadsound('cokecity', 3);
      music['jamesbond']=loadsound('jamesbond', 3);
      music['blendedbrain']=loadsound('blendedbrain', 5);
      music['face1']=loadsound('face1', 5);
      music['face2']=loadsound('face2', 5);

		

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
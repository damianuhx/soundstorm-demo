
var get={}; //all objects for custom use (e.g. shaders)

get.heightfiler = function (texture, texture_h, texture_n, options={}) 
   {
    returnfilter = new HeightmapFilter(texture_h, 20, texture, texture_n);
    //returnfilter = new HeightmapFilter(heightsprite, 20);
    returnfilter.scale.x=0;
    returnfilter.scale.y=120;
    returnfilter.light=1.0;
    returnfilter.invert=-1.0;
    returnfilter.repeat=1.0;
    returnfilter.normal={x: 0.0, y: 0.0};
    returnfilter.factor={x: 1.0, y: 1.0};
    returnfilter.offset = {x: 0.0, y: 0.0};
    returnfilter.zoom=1.0;
    returnfilter.alpha=1.0;
     return returnfilter;
   }

   get.outline = function (options={}){
      let returnfilter = new PIXI.filters.OutlineFilter(options.size || 4, options.color || 0x222222, 0.03);
      if (settings.outline==false){returnfilter.enabled=false;
      }
      return returnfilter;
   }

   get.glowsingle=function(options={}){
      let returnfilter =  new PIXI.filters.GlowFilter({outerStrength: 0.1, color: options.color || 0xFFFFFF, distance: 50, quality: 0.01})
      if (!settings.outline){returnfilter.enabled=false;}
      return returnfilter;
    //insert this in sprite:
    //sprite.ai[0].push(ai.glowbeat.bind(sprite, sprite.filters[0], beatlayer, 0.5, 2));
   }

   get.shadow = function(options={}){
      let returnfilter = new PIXI.filters.DropShadowFilter({shadowOnly: false});
      if (!settings.shadow){returnfilter.enabled=false;}
      return returnfilter;
       //sprite.ai[1].push(ai.shadow.bind(sprite, sprite.filters[1]));
   }

   get.alpha = function(options={}){
      return new PIXI.AlphaFilter (options.alpha||0)
   }



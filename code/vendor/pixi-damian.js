//todo:
//create tiling sprite
//add heightmapfilter
//change heightmap filter to displace relative to the middle (i.e. scale = position)
//change normalmap filter: dot() of normalized vectors


/*custom by damian*/
//Custom Heightmap Filter. Modified displacement filter from PIXI
var fragment$height = `varying vec2 vFilterCoord;
varying vec2 vTextureCoord;

uniform vec2 offset;
uniform vec2 scale;
uniform vec2 gain; // displacement static (not depending on screen position)
uniform mat2 rotation;
uniform sampler2D uSampler;
uniform sampler2D texSampler;
uniform sampler2D mapSampler;
uniform sampler2D normalSampler;
uniform float invert;
uniform float light;
uniform float alpha;
uniform float beat;
uniform float repeat;
uniform vec2 normal;
uniform vec2 factor;
uniform float zoom;

//float repeat=1.0;
uniform highp vec4 inputSize;
uniform vec4 inputClamp;

void main(void)
{
  vec2 nFilterCoord = vFilterCoord * zoom - 0.5 * zoom + 0.5;
  float screenheight = (gl_FragCoord.y/1080.0)-0.5;
  vec4 map =  texture2D(mapSampler, fract((nFilterCoord + offset))); //holt wert von heightmap //1
  map -= 0.5;

  map.xy =  scale * inputSize.zw * (rotation * map.xy); //berechnet wie viel der pixel versetzt werden muss

  //uniform repeat: with and without fract: nFilterCoord.y + offset.y + map.y * invert * screenheight 
  float posY = (nFilterCoord.y + offset.y + map.y * invert * screenheight); //2
 
  //posY-=repeat*floor(posY);
  
  vec2 pos = fract(  vec2(fract( (nFilterCoord.x + offset.x + map.x )), posY  )); //3 * 2 //bestimmt von wo der pixel geholt werden muss

  vec4 normalVector = texture2D(normalSampler, pos   * 0.05 * (20.0-beat) + beat/40.0);
  normalVector.x -= 0.5;
  normalVector.y -= 0.5;
  normalVector.xy *= invert;

  //sidewards scrolling (with factor x) not implemented yet
  vec3 lightVector = normalize(vec3(normal.x * invert /* factor.x*/, -2.5 * factor.y*(screenheight) + normal.y, 1.0));

  vec3 NormalVector = normalize(normalVector.xyz);

  float diffuse = 1.0 * max(dot(NormalVector, lightVector), 0.2) * light;
  diffuse=diffuse*diffuse*alpha;

  if (repeat > 0.5 || (posY < 1.0 && posY > 0.0)){
    gl_FragColor = texture2D(texSampler, fract(pos)) * vec4(diffuse, diffuse, diffuse, alpha);
  }
  
  
  //*= alpha from new uniform

  //gl_FragColor = texture2D(texSampler, clamp(vec2(vTextureCoord.x + map.x , vTextureCoord.y + map.y * ((gl_FragCoord.y/1080.0)-0.5)), inputClamp.xy, inputClamp.zw));
}
`, vertex$height = `attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;
uniform mat3 filterMatrix;
uniform vec2 offset;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

vec4 filterVertexPosition( void )
{
    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0)).xy,  0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
	gl_Position = filterVertexPosition();
	vTextureCoord = filterTextureCoord();
	vFilterCoord = ( filterMatrix * vec3( vTextureCoord, 1.0)  ).xy;
}
`;

//
  class HeightmapFilter extends PIXI.Filter {
    /**
     * @param {PIXI.Sprite} sprite - The sprite used for the displacement map. (make sure its added to the scene!)
     * @param scale - The scale of the displacement
     */
    constructor(sprite, scale, texture, normalmap) {
      const maskMatrix = new PIXI.Matrix();
      sprite.renderable = !1, super(vertex$height, fragment$height, {
        mapSampler: sprite._texture,
        texSampler: texture,
        normalSampler: normalmap,
        filterMatrix: maskMatrix,
        scale: { x: 1, y: 1 },
        offset: { x: 0, y: 0 },
        light: 1.0,
        alpha: 1.0,
        zoom: 1.0,
        invert: 1.0,
        beat: 0.0,
        repeat: 0.0, //fract or not
        normal: { x: 0.0, y: 0.0 }, //ofset of x coordinates of light vector
        factor: { x: 1.0, y: 1.0 }, //multiplier of y coordinates of light vector
        rotation: new Float32Array([1, 0, 0, 1])
      }), this.maskSprite = sprite, this.maskMatrix = maskMatrix, scale == null && (scale = 20), this.scale = new PIXI.Point(scale, scale);
    }
    /**
     * Applies the filter.
     * @param filterManager - The manager.
     * @param input - The input target.
     * @param output - The output target.
     * @param clearMode - clearMode.
     * 
     * >4x6 uniform variablen für heightmapfilter:
      h/n/tex x offset/zoom/screen x x/y = 9xvec2
      tex: √offset, zoom, (wölbung?)
      n: √normal, (√)beat, √factor
      h: (verschieben des offsets), (zoomen des offsets), √scale
     */
    apply(filterManager, input, output, clearMode) {
      this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, this.maskSprite), 
      this.uniforms.scale.x = this.scale.x, 
      this.uniforms.scale.y = this.scale.y, 
      //texture offset
      this.uniforms.offset.x = this.offset.x, 
      this.uniforms.offset.y = this.offset.y,
      //texture invert (helper)
      this.uniforms.invert = this.invert,
      //normale zoom
      this.uniforms.beat = this.beat,
      //light 0=black, 1=normal
      this.uniforms.light = this.light,
      this.uniforms.alpha = this.alpha,
      this.uniforms.zoom = this.zoom,
      //does the texture repeat (make true for tiling textures)
      this.uniforms.repeat = this.repeat,
      //xy for normal offset
      this.uniforms.normal = this.normal,
      //xy for normal screen
      this.uniforms.factor = this.factor;
      const wt = this.maskSprite.worldTransform, 
      lenX = Math.sqrt(wt.a * wt.a + wt.b * wt.b), 
      lenY = Math.sqrt(wt.c * wt.c + wt.d * wt.d);
      lenX !== 0 && lenY !== 0 && (this.uniforms.rotation[0] = wt.a / lenX, 
      this.uniforms.rotation[1] = wt.b / lenX, 
      this.uniforms.rotation[2] = wt.c / lenY, 
      this.uniforms.rotation[3] = wt.d / lenY), 
      filterManager.applyFilter(this, input, output, clearMode);
    }
    /** The texture used for the displacement map. Must be power of 2 sized texture. */
    get map() {
      return this.uniforms.mapSampler;
    }
    set map(value) {
      this.uniforms.mapSampler = value;
    }
  }


/*custom end*/
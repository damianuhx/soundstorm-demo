<script id="fragShader" type="shader-code">
		uniform sampler2D tex;//The main texture
		uniform sampler2D norm;//The normal texture
		uniform vec2 res;//Our screen dimensions
		uniform vec4 light;//Our light source information
	  varying vec2 vTextureCoord;
		void main() {
        vec2 pixel = vTextureCoord;
        vec4 color = texture2D(tex,pixel);
        vec4 normalVector = texture2D(norm,pixel);//We get the normal value of this pixel
        vec2 lightPosition = light.xy;//We normalize the light source

        //We calculate the direction from the light to this pixel
        vec3 LightVector = vec3(lightPosition.x - pixel.x,lightPosition.y - pixel.y,light.z);
        
        //By "up" direction of our normal map has the value (0.5,0.5,1.0) in terms of rgb
        //So we offset by that amount
        normalVector.x -= 0.5;
        normalVector.y -= 0.5;
        //We normalize our vectors to compute the direction
        vec3 NormalVector = normalize(normalVector.xyz);
        LightVector = normalize(LightVector);

        // Compute the diffuse term for the Phong equation
        float diffuse      = 1.5 * max(dot( NormalVector, LightVector ),0.0);
      
        //Toggle light system on or off
        if(light.w == 0.0){
           gl_FragColor = color;
        } else {
          gl_FragColor = color * diffuse;
        }

		 }
	</script>






const width = window.innerWidth;
const height = window.innerHeight;

const app = new PIXI.Application({ width, height});
document.body.appendChild(app.view);

const shaderCode = document.getElementById("fragShader").innerHTML;

//Our textures are up on github
var textureURL = "https://raw.githubusercontent.com/tutsplus/Beginners-Guide-to-Shaders/master/Part3/images/blocks.JPG"
var normalURL = "https://raw.githubusercontent.com/tutsplus/Beginners-Guide-to-Shaders/master/Part3/normal_maps/blocks_normal.JPG"

//Load in the texture and the normal
var texture = PIXI.Texture.from(textureURL);
var normal = PIXI.Texture.from(normalURL);


//Set up the uniforms we'll send to our share
//More info on uniform types: https://threejs.org/docs/#Reference/Materials/ShaderMaterial
var uniforms = {
  tex : texture,//The texture
  norm: normal,//Normal
  res : new Float32Array([window.innerWidth,window.innerHeight]),//Keeps the resolution
  light: new Float32Array(4),//Our light source, we will use the 3 numbers as have x,y and height away from the screen. 4th value is whether the light is on or not
}
//We stick our shader onto a 2d plane big enough to fill the screen

const material = new PIXI.Shader.from(null, shaderCode, uniforms)
const geometry = new PIXI.Geometry()
geometry.addIndex([0,1,2,0,2,3])
geometry.addAttribute('aVertexPosition', // the attribute name
        [0, 0, width, 0, width, height, 0, height], // x, y
        2);
//those are UV's in default vertex shader
geometry.addAttribute('aTextureCoord', // the attribute name
        [0, 0, 1, 0, 1, 1, 0, 1], // x, y
        2)
const mesh = new PIXI.Mesh( geometry,material );
//Add it to the scene
// scene.add( sprite );
app.stage.addChild(mesh)

uniforms.light[2] = 0.3;//How high up our light source should be
uniforms.light[3] = 1.0;//Turn light on

mesh.interactive = true;
mesh.on('mousemove', (event) => {
	// coords are event.data.global, but we transform them 
	// in case you move mesh somewhere else (position, scale)
	const point = event.data.getLocalPosition(mesh);
  //Update the light source to follow our mouse
  uniforms.light[0] = point.x / width;
  uniforms.light[1] = point.y / height;
});

mesh.on('mousedown', (event) => {
  if(uniforms.light[3])
     uniforms.light[3] = 0.0;
  else uniforms.light[3] = 1.0;
})



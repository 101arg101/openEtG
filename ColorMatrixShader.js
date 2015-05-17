// From PIXI
module.exports = function ColorMatrixFilter(renderer)
{
	return new PIXI.TextureShader(renderer.shaderManager,
		null, "precision mediump float;varying vec2 vTextureCoord;uniform sampler2D uSampler;uniform mat4 matrix;void main(void){gl_FragColor=texture2D(uSampler,vTextureCoord).gbra;}",
		null, null);
}
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uSceneTexture;
uniform sampler2D uBloomTexture;
uniform float iTime;

float tScale = 0.5*cos(iTime) + 0.5;

void main() {
    vec4 sceneColor = texture2D(uSceneTexture, vTexCoord);
    vec4 bloomColor = texture2D(uBloomTexture, vTexCoord);
    vec3 color = vec3(0.0);
    if(sceneColor.r>=0.5&&sceneColor.g>=0.5&&sceneColor.b>=0.5){
        sceneColor.rgb = 2.0 * (sceneColor.rgb-0.5);
    }else{
        sceneColor.rgb = sceneColor.rgb * 2.001;  
    }
    vec3 SC = sceneColor.rgb;
    vec3 BC = bloomColor.rgb;
    color = SC * 1.0 + BC*0.7;
    gl_FragColor = vec4(color, 1.0);
}

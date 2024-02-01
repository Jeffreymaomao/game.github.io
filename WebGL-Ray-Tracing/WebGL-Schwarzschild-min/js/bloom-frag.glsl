precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uSceneTexture;
uniform vec3 iResolution;
const int STEP = 10;

const float blurX = 7.0;
const float blurY = 4.5;

vec3 sceneColorToGray(vec2 coord){
    // texture to GRAY color
    vec3 color = texture2D(uSceneTexture, coord).rgb/0.9;
    if(color.r>=0.5&&color.g>=0.5&&color.b>=0.5){
        return color;
    }
    return vec3(0.0);
}

void main() {
    vec3 color = vec3(0.0);
    // --- blur
    float totalWeight = 0.0;
    float sigma = float(STEP)*0.009; 
    for (int i = -STEP; i <= STEP; ++i) {
        for (int j = -STEP; j <= STEP; ++j) {
            float x = float(i)*blurX/iResolution.x;
            float y = float(j)*blurY/iResolution.y;
            float weight = exp(-(x*x+y*y)*0.5/(sigma*sigma));
            vec3 c = sceneColorToGray(vTexCoord + vec2(x,y));
            color += c * weight;
            totalWeight += weight;
        }
    }
    color = color/totalWeight;
    color = color * vec3(0.6,0.7,0.8) + color*vec3(0.89,0.7,0.4);
    gl_FragColor = vec4(color, 1.0);
}




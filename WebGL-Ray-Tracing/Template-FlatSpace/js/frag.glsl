precision mediump float;
// uniform 
uniform float iTime;
uniform vec3 iResolution;
uniform float polarAngle;
uniform float azimuthalAngle;
uniform float cameraDistance;
uniform sampler2D uSkysphere;
#define PI 3.1415925359
#define ITERATION 200

vec3 spherical2Cartesian(float r, float theta, float phi){
    return r * vec3(sin(theta)*cos(phi), sin(theta)*sin(phi), cos(theta));
}

vec3 background(vec3 dir){
    dir = -dir.xyz;
    float azimuth = atan(dir.y, dir.x);
    float elevation = asin(dir.z);
    vec2 texCoords = vec2(azimuth / (2.0 * PI), elevation / PI) + 0.5;
    return texture2D(uSkysphere, texCoords).rgb * 0.499;
}

float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xy) - t.x, p.z);
    return length(q)-t.y;
}

vec3 Haze(vec3 pos) {
    float waveTime = (1.0 + cos(2.0 * iTime)) + 0.5;
    
    vec2 t = vec2(5.0, 0.001); // main radius, sub radius 
    float dist = sdTorus(pos, t);
    float bloomDisc = 1.0 / (pow(dist, 2.0) + 0.00001);
    
    return vec3(bloomDisc);
}

vec3 rayMarching(vec3 origin, vec3 direction){
    float far = 30.0; // how far the pos can go 
    float backgroundScale = 3.0;
    vec3 color = vec3(0.0);
    vec3 pos = origin;
    
    for(int i=0;i<ITERATION;i++){
        pos += direction * far / float(ITERATION); 
        color += Haze(pos)/float(ITERATION);
    }
    color += backgroundScale * background(direction);
    return color;
}

// Camera parameters
void main() {
    // Setup ray from camera
    vec2 screenPos = (2.0 * gl_FragCoord.xy - iResolution.xy) / iResolution.y;
    vec3 cameraPos = spherical2Cartesian(cameraDistance, azimuthalAngle, polarAngle);
    vec3 cameraDir = normalize(vec3(0.0, 0.0, 0.0) - cameraPos); // camera point to origin
    vec3 cameraRight = normalize(cross(cameraDir, vec3(0.0, 0.0, 1.0)));
    vec3 cameraUp = cross(cameraRight, cameraDir);
    float cameraFOV = PI / 2.5; // Field of View (FoV)
    float fovFactor = tan(cameraFOV*0.5);
    vec3 rayDir = normalize(cameraDir + fovFactor * screenPos.x * cameraRight + fovFactor * screenPos.y * cameraUp);

    // ray marching 
    vec3 color = rayMarching(cameraPos, rayDir);
    gl_FragColor = vec4(color, 1.0);
}



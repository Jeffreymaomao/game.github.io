precision mediump float;

const float PI = 3.1415925359;
const float MAX_DISTANCE = 500.0;
const float EPSILON = 0.001;
const int MAX_STEPS = 200;

// uniform 
uniform float iTime;
uniform float polarAngle;
uniform float azimuthalAngle;
uniform float cameraDistance;
uniform vec3 iResolution;
uniform samplerCube uSkybox;


// Ray 
struct Ray{
    vec3 origin;
    vec3 direction;
};

// Signed Distance Function (SDF) of Object
float sdSphere(vec3 pos, vec3 center, float radius) {
    return length(pos - center) - radius;
}

float sdBox(vec3 pos, vec3 center, vec3 size ) {
  vec3 q = abs(pos - center) - size;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdRoundBox(vec3 pos, vec3 center, vec3 size, float r ) {
  vec3 q = abs(pos - center) - size;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}
// Scene sd 
float sdScene(vec3 pos) {
    float dist1 = sdBox(pos, vec3(5.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));
    float dist2 = sdBox(pos, vec3(0.0, 5.0, 0.0), vec3(1.0, 1.0, 1.0));
    float dist3 = sdBox(pos, vec3(0.0, 0.0, 5.0), vec3(1.0, 1.0, 1.0));

    return min(dist1, min(dist2, dist3));

}


// Ray Marching
vec3 RayMarching(Ray ray){
    vec3 color = vec3(0.0);
    float t = 0.0;
    for(int i=0;i<MAX_STEPS;i++){
        vec3 position = ray.origin + ray.direction * t;
        float distance = sdScene(position);
        if(distance < EPSILON){
            color = vec3(1.0);
            break;

        }else if(t > MAX_DISTANCE){
            color = textureCube(uSkybox, ray.direction.xzy).rgb;
            break;
        }

        t += distance;
    };
    return color;
}



// Camera parameters
void main() {
    // Setup ray from camera
    vec2 screenPos = (2.0 * gl_FragCoord.xy - iResolution.xy) / iResolution.y;
    vec3 cameraPos = cameraDistance * vec3(sin(azimuthalAngle)*cos(polarAngle),sin(azimuthalAngle)*sin(polarAngle),cos(azimuthalAngle));
    vec3 cameraDir = normalize(vec3(0.0, 0.0, 0.0) - cameraPos); // camera point to origin
    vec3 cameraRight = normalize(cross(cameraDir, vec3(0.0, 0.0, 1.0)));
    vec3 cameraUp = cross(cameraRight, cameraDir);
    float cameraFOV = PI / 2.6; // Field of View (FoV)
    float fovFactor = tan(cameraFOV/2.0);
    vec3 rayDir = normalize(cameraDir + fovFactor * screenPos.x * cameraRight + fovFactor * screenPos.y * cameraUp);
    Ray ray = Ray(cameraPos, rayDir);
    // ray marching 
    vec3 color = RayMarching(ray);
    gl_FragColor = vec4(color, 1.0);
}



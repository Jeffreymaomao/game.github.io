precision mediump float;

// uniform 
uniform float iTime;
uniform float polarAngle;
uniform float azimuthalAngle;
uniform float cameraDistance;
uniform vec3 iResolution;
uniform samplerCube uSkybox;

// Physics constant
const float PI = 3.1415925359;
const float DT = 0.1;
const int MAX_STEPS = 500;

const float MAX_DISTANCE = 40.0;

const float RADIUS = 2.0;


// Ray 
struct Ray{
    vec3 origin;
    vec3 direction;
};

// Ray Marching
vec3 RayMarching(Ray ray){
    vec3 color = vec3(0.0);
    vec3 pos = ray.origin;
    vec3 pos_next = ray.origin;
    float t = 0.0;

    for(int STEP=0; STEP<MAX_STEPS; STEP++){
        pos_next = ray.origin + ray.direction * t;
        t += DT;
        // ---
        float r = length(pos);
        float theta = acos(pos.z/r);
        float phi = sign(pos.y)*acos(pos.x/sqrt(pos.x*pos.x + pos.y*pos.y));

        // ---
        if(r < RADIUS && pos.z*pos_next.z<0.0){
            color = vec3(r/RADIUS);
            break;
        }

        if(t > MAX_DISTANCE){
            color = textureCube(uSkybox, ray.direction.xzy).rgb;
            break;
        }
        pos = pos_next;
    };
    return color;
}



// Camera parameters
void main() {
    // Setup ray from camera
    vec2 screenPos = (2.0 * gl_FragCoord.xy - iResolution.xy) / iResolution.y;
    vec3 cameraPos = cameraDistance * vec3(
        sin(azimuthalAngle)*cos(polarAngle),
        sin(azimuthalAngle)*sin(polarAngle),
        cos(azimuthalAngle));
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



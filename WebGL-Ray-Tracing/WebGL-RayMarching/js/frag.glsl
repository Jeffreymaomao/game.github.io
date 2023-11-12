precision mediump float;

const float PI = 3.1415925359;
// const float TWO_PI = 6.2831850718;
// const float HALF_PI = 1.57079626795;
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

// smooth 
float smoothMin(float dstA, float dstB, float k) {
    float h = max(k-abs(dstA-dstB), 0.0) / k;
    return min(dstA, dstB) - h*h*h*k/6.0;
}

// rotate vector
mat4 rotationMatrix(vec3 axis, float angle) {
    // axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
    mat4 m = rotationMatrix(axis, angle);
    return (m * vec4(v, 1.0)).xyz;
}

// Ray 
struct Ray{
    vec3 origin;
    vec3 direction;
};

struct SceneResult {
    float distance;
    vec3 color;
};

vec3 reflectRay(vec3 incident, vec3 normal) {
    return incident - 2.0 * dot(incident, normal) * normal;
}

// Signed Distance Function (SDF) of Object
// https://iquilezles.org/articles/distfunctions/
float sdSphere(vec3 pos, vec3 center, float radius) {
    return length(pos - center) - radius;
}

float sdBox( vec3 pos, vec3 center, vec3 size ) {
  vec3 q = abs(pos - center) - size;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdRoundBox( vec3 pos, vec3 center, vec3 size, float r ) {
  vec3 q = abs(pos - center) - size;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}

// Signed Distance Function for Scene
#define NUM_OBJECTS 2
SceneResult objects[NUM_OBJECTS];

void setupScene(vec3 pos) {

    objects[0].distance = sdBox(pos, vec3(0.0, 0.0, -3.0), vec3(8.0, 6.0, 0.2));
    objects[0].color = vec3(1.0, 1.0, 1.0); // 紅色

    vec3 objPos = vec3(3.0 * cos(iTime*2.0), 0.0, 0.0);
    float dist1 = sdSphere(pos, objPos, 1.0);
    float dist2 = sdRoundBox(pos, -objPos, vec3(1.0, 3.0, 2.0), 0.5);
    float dist = smoothMin(dist1,dist2, 5.0);
    vec3 color1 = vec3(1.0, 0.2, 0.2);
    vec3 color2 = vec3(0.2, 0.2, 1.0);

    vec3 mixedColor;
    float c = smoothstep(0.0, 1.0, abs(dist1 - dist2)/5.0);
    mixedColor = mix(color1, color2, c);
    objects[1].distance = dist;
    objects[1].color = mixedColor;
}

SceneResult sdScene(vec3 pos) {
    setupScene(pos);

    SceneResult closestResult;
    closestResult.distance = MAX_DISTANCE;
    closestResult.color = vec3(1.0); // 默認顏色

    for (int i = 0; i < NUM_OBJECTS; i++) {
        if (objects[i].distance < closestResult.distance) {
            closestResult = objects[i];
        }
    }

    return closestResult;
}

// normal vector by Signed Distance Function (SDF) 
vec3 calculateNormal(vec3 pos) {
    vec2 e = vec2(1.0,-1.0)*0.5773*0.0005;
    return normalize(
        e.xyy * sdScene( pos + e.xyy ).distance + 
        e.yyx * sdScene( pos + e.yyx ).distance + 
        e.yxy * sdScene( pos + e.yxy ).distance + 
        e.xxx * sdScene( pos + e.xxx ).distance
    );
}

// Light
bool inShadow(vec3 pos, vec3 lightPos) {
    vec3 dir = normalize(lightPos - pos);
    float distToLight = length(lightPos - pos);
    float t = 0.01; // 避免自我遮擋

    for(int i = 0; i < MAX_STEPS; i++) {
        float dist = sdScene(pos + dir * t).distance;
        if (dist < EPSILON) return true; // 遇到障礙物，處於陰影中
        t += dist;
        if (t >= distToLight) break; // 到達光源
    }
    return false;
}

vec3 calculateColor(Ray ray, vec3 pos, vec3 normal, vec3 objectColor, vec3 lightPos, vec3 lightColor, vec3 ambientColor) {
    vec3 lightDir = normalize(lightPos - pos);
    
    // 漫反射
    // float diff = inShadow(pos, lightPos) ? 0.0 : max(dot(normal, lightDir), 0.0);
    float diff = max(dot(normal, lightDir), 0.0);

    // 環境光
    vec3 ambient = ambientColor;

    // 高光反射 (Blinn-Phong模型)
    float specularStrength = 0.5; // 調整高光強度
    vec3 viewDir = normalize(-ray.direction);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);
    vec3 specular = specularStrength * spec * lightColor;

    // 總光照
    vec3 color = (ambient + diff * lightColor + specular) * objectColor;
    return color;
}

// Ray Marching
vec3 RayMarching(Ray ray){
    // light 
    vec3 lightPos = vec3(10.0, 10.0, 10.0);
    vec3 lightColor = vec3(1.0);
    vec3 ambientColor = vec3(0.3);


    vec3 color = vec3(0.0);
    float t = 0.0;
    for(int i=0;i<MAX_STEPS;i++){
        vec3 position = ray.origin + ray.direction * t;
        SceneResult sceneResult = sdScene(position);
        float distance = sceneResult.distance;
        if(distance < EPSILON){
            vec3 normal = calculateNormal(position);
            color = calculateColor(ray, position, normal, sceneResult.color, lightPos, lightColor, ambientColor);
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
    // vec2 gl_FragCoord : [0,1], [0,1] 
    // vec2 screenPos : [-width/height ~ width/height], [-1.0 ~ 1.0]
    vec2 screenPos = (2.0 * gl_FragCoord.xy - iResolution.xy) / iResolution.y;

    // camera 
    vec3 cameraPos = cameraDistance * vec3(
        sin(azimuthalAngle)*cos(polarAngle),
        sin(azimuthalAngle)*sin(polarAngle),
        cos(azimuthalAngle)); // spherical coordinate
    vec3 cameraDir = normalize(vec3(0.0, 0.0, 0.0) - cameraPos); // camera point to origin
    vec3 cameraRight = normalize(cross(cameraDir, vec3(0.0, 0.0, 1.0)));
    vec3 cameraUp = cross(cameraRight, cameraDir);
    float cameraFOV = PI / 2.6; // Field of View (FoV)
    float fovFactor = tan(cameraFOV/2.0);

    // ray
    vec3 rayDir = normalize(cameraDir 
            + fovFactor * screenPos.x * cameraRight 
            + fovFactor * screenPos.y * cameraUp
            );
    Ray ray = Ray(cameraPos, rayDir);

    // ray marching 
    vec3 color = RayMarching(ray);
    gl_FragColor = vec4(color, 1.0);
}



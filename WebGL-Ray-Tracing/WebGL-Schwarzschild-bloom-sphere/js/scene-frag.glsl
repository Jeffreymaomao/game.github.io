precision mediump float;

// uniform 
uniform float iTime;
uniform float polarAngle;
uniform float azimuthalAngle;
uniform float cameraDistance;
uniform int drawDisk;
uniform vec3 iResolution;
uniform samplerCube uSkybox;

// Physics constant
const float PI = 3.1415925359;
const int MAX_STEPS = 800;
const float MAX_DISTANCE = 100.0;

const float RS = 1.0; // Schwarzschild Radius
const float MIN_RADIUS = 2.6*RS; // Schwarzschild Radius
const float MAX_RADIUS = 7.0*RS; // Schwarzschild Radius


// random 
float hash(float n) { 
    return fract(sin(n) * 43758.5453);
}

float noise(vec3 x) {
    // 0 ~ 1
    vec3 p = floor(x);
    vec3 f = fract(x);

    float n = p.x + p.y * 57.0 + 113.0 * p.z;

    return mix(mix(mix( hash(n + 0.0), hash(n + 1.0), f.x),
                   mix( hash(n + 57.0), hash(n + 58.0), f.x), f.y),
               mix(mix( hash(n + 113.0), hash(n + 114.0), f.x),
                   mix( hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
}

float saturate(float x) {
    return clamp(x, 0.0, 1.0);
}

vec3 radialColorLikeInterstellar(float r){
    // r = 0 ~ 1;
    float x = 1.0 - r; // r = 1.0 - x

    float x2 = x*x;
    float x3 = x2*x;
    float x4 = x3*x;
    
    float r2 = r*r;
    float r3 = r2*r;
    float r4 = r3*r;

    float R = r4 + 4.0 * r3 * x + 5.6 * r2 * x2 + 2.5 * r * x3 + 0.57 * x4;
    float G = r4 + 4.0 * r3 * x + 3.8 * r2 * x2 + 1.9 * r * x3 + 0.47 * x4;
    float B = r4 + 3.0 * r3 * x + 4.2 * r2 * x2 + 1.9 * r * x3 + 0.47 * x4;

    return vec3(R,G,B);
}

vec3 adjustSaturation(vec3 color, float saturationFactor) {
    // 計算原始顏色的平均亮度
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));

    // 混合原始顏色和灰度顏色
    return mix(vec3(luminance), color, saturationFactor);
}


vec3 interpolateColors(float r) {
    vec3 result;
    vec3 c1 = vec3(146.0,121.0,121.0);// rgb(146,121,121)
    vec3 c2 = vec3(166.0,145.0,145.0);// rgb(166,145,145)
    vec3 c3 = vec3(221.0,188.0,180.0);// rgb(221,188,180)
    vec3 c4 = vec3(249.0,235.0,229.0);// rgb(249,235,229)
    vec3 c5 = vec3(255.0,255.0,255.0);// rgb(255,255,255)

    if (r < 0.25) {
        float t = r / 0.25;
        result = mix(c1, c2, t);
    } else if (r < 0.5) {
        float t = (r - 0.25) / 0.25;
        result = mix(c2, c3, t);
    } else if (r < 0.75) {
        float t = (r - 0.5) / 0.25;
        result = mix(c3, c4, t);
    } else {
        float t = (r - 0.75) / 0.25;
        result = mix(c4, c5, t);
    }
    return result/225.0;
}

// color 
vec3 calculateColor(vec3 pos, float rad, float distance, vec3 backgroundColor){
    float color = 1.0 * noise(vec3(30.0*rad));
    color *= exp(-distance * 0.01);
    color *= sqrt(rad) + 1.3;
    vec3 diskColor = interpolateColors(sqrt(rad))*0.6 +  0.4*color;
    diskColor = adjustSaturation(diskColor, 2.0);

    float alpha = rad + 0.8;
    return mix(backgroundColor, diskColor, clamp(alpha, 0.0, 1.0));
}





// Ray 
struct Ray{
    vec3 origin;
    vec3 direction;
};

vec2 ODE(float x, vec2 U){
    return vec2(U.y, 1.5*U.x*U.x - U.x);
}

vec2 RK1(float x, vec2 U, float h) {
    return U + ODE(x, U) * h;
}

// Ray Marching
vec3 RayMarching(Ray ray){
    vec3 color = vec3(0.0);
    vec3 pos = ray.origin;
    vec3 dir = ray.direction;
    vec3 pos_last = ray.origin;
    vec3 axisX = -ray.direction;
    vec3 axisY = normalize(cross(cross(ray.direction, ray.origin), ray.direction));

    float r = length(pos);
    float phi = 0.0;
    float alpha = 0.0;  // this angle is for solving ODE
    float alpha0 = PI - acos(dot(ray.direction, ray.origin)/r);
    float b = r * sin(alpha0);
    float dalpha = 0.01;

    vec2 U = vec2(0.0, RS/b); // [ u(0), u'(0) ]

    bool isHit = false;
    bool isInside = true;

    float hitRad = 0.0;
    float hitDistance = 0.0;

    for(int STEP=0; STEP<MAX_STEPS; STEP++){
        vec3 pos_last = pos;
        float r_last = r;
        // --- solving ODE
        U = RK1(alpha, U, dalpha);
        alpha += dalpha;
        r = RS/U.x;

        // --- update position and drection
        pos = r * axisX * cos(alpha) + r * axisY * sin(alpha);
        dir = normalize(pos - pos_last);
        
        if(!isHit){hitDistance += r * dalpha;}

        // --- sheck hit
        float rad = (r-MIN_RADIUS)/(MAX_RADIUS-MIN_RADIUS);
        phi = sign(pos.y)*acos(pos.x/sqrt(pos.x*pos.x+pos.y*pos.y));

        phi += iTime*0.3;

        if( r > MIN_RADIUS && r < MAX_RADIUS && pos.z*pos_last.z<0.0){
            rad -= 0.02 * noise(vec3(40.0*phi, 30.0*rad, 1.0));
            if(!isHit){hitRad = 1.0-rad;}
            isHit = true;
            // break; //since we need background
        }
        // --- sheck over
        if( r * r_last < 0.0 ){
            isInside = false;
            break;
        }
    }
    vec3 backgroundColor = textureCube(uSkybox, -dir.xzy).rgb * 0.499;
    if(drawDisk>0 && isHit){
        if(isInside){backgroundColor = vec3(0.0, 0.0, 0.0);}
        color = calculateColor(pos, hitRad, hitDistance, backgroundColor);
        color = color * 0.5 + 0.5;
    }else if(isInside){
        color = vec3(0.0, 0.0, 0.0);
    }else{
        color = backgroundColor;
    }
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
    float fovFactor = tan(cameraFOV*0.5);
    vec3 rayDir = normalize(cameraDir + fovFactor * screenPos.x * cameraRight + fovFactor * screenPos.y * cameraUp);
    Ray ray = Ray(cameraPos, rayDir);
    // ray marching 
    vec3 color = RayMarching(ray);
    gl_FragColor = vec4(color, 1.0);
}



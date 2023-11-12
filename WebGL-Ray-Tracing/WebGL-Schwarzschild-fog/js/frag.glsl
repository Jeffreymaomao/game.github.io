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
const int MAX_STEPS = 800;
const float MAX_DISTANCE = 100.0;

const float RS = 1.0; // Schwarzschild Radius
const float MIN_RADIUS = 2.6*RS; // Schwarzschild Radius
const float MAX_RADIUS = 7.0*RS; // Schwarzschild Radius
const bool drawDisk = true;

// color transformation
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// noise
float random(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // 四個角的隨機數
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // 平滑插值
    vec2 u = f*f*(3.0-2.0*f);

    return mix(a, b, u.x) +
           (c - a)* u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
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

vec2 RK2(float x, vec2 U, float h) {
    vec2 k1, k2;
    k1 = ODE(x, U);
    k2 = ODE(x+h, U+k1*h);
    return U + (k1+k2)*h*0.5;
}
vec2 RK4(float x, vec2 U, float h) {
    vec2 k1, k2, k3, k4;
    k1 = ODE(x, U);
    k2 = ODE(x + h*0.5, U + k1 * h*0.5);
    k3 = ODE(x + h*0.5, U + k2 * h*0.5);
    k4 = ODE(x + h,     U + k3 * h);
    return U + (k1 + k2*2.0 + k3*2.0 + k4)*h/6.0;
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
    float alpha = 0.0;  // this angle is for solving ODE
    float alpha0 = PI - acos(dot(ray.direction, ray.origin)/r);
    float b = r * sin(alpha0);
    float dalpha = 0.01;
    float max_alpha = 2.0*PI;

    vec2 U = vec2(0.0, RS/b); // [ u(0), u'(0) ]

    bool isHit = false;
    bool isInside = true;
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

        // --- sheck hit
        if( r > MIN_RADIUS && r < MAX_RADIUS && pos.z*pos_last.z<0.0){
            isHit = true;
            if(drawDisk){break;}
        }
        // --- sheck over
        if( r * r_last < 0.0 ){
            isInside = false;
            break;
        }
    }
    color = textureCube(uSkybox, -dir.xzy).rgb;
    if(drawDisk){
        if(isHit){
            float phi = sign(pos.y)*acos(pos.x/sqrt(pos.x*pos.x + pos.y*pos.y));
            float rad = (r-MIN_RADIUS)/(MAX_RADIUS-MIN_RADIUS);
            float n = noise(pos.xy * 2.0); // 調整噪聲的尺度
            float hue = (1.0-rad * n)*0.05  + n * 0.1 + cos(phi+2.0)*0.05;
            vec3 hsv = vec3(hue, 1.0, 0.8 + 0.2*n);
            color = mix(hsv2rgb(hsv), vec3(1.0), n * 0.1); // 根據噪聲混合顏色

        }else if(isInside){
            color = vec3(0.0);
        }
    }else if(isInside){
        color = vec3(0.0);
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



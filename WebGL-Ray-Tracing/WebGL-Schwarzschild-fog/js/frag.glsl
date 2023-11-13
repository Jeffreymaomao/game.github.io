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
float saturate(float x) {
    return clamp(x, 0.0, 1.0);
}

vec3 saturate(vec3 x) {
    return clamp(x, vec3(0.0), vec3(1.0));
}

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

float atan2(float y, float x) {
    if (x > 0.0) {
        return atan(y / x);
    }
    else if (x == 0.0) {
        if (y > 0.0) {
            return PI / 2.0;
        }
        else if (y < 0.0){
            return -(PI / 2.0);
        }
        else {
            return 0.0;
        }
    }
    else {
        if (y >= 0.0) {
            return atan(y / x) + PI;
        }
        else {
            return atan(y / x) - PI;
        }
    }
}

// noise

float random(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec3 s) {
    vec2 st = s.xy; 
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

float pcurve( float x, float a, float b ) {
    float k = pow(a+b,a+b) / (pow(a,a)*pow(b,b));
    return k * pow( x, a ) * pow( 1.0-x, b );
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

vec3 calculateTexture(vec3 pos, float r){
    float rad = (r-MIN_RADIUS)/(MAX_RADIUS-MIN_RADIUS);
    float n = noise(pos * 2.0); // 調整噪聲的尺度
    float phi = sign(pos.y)*acos(pos.x/sqrt(pos.x*pos.x + pos.y*pos.y));
    float hue = (1.0-rad * n)*0.05  + n * 0.1 + cos(phi+2.0)*0.05;
    vec3 hsv = vec3(hue, 1.0, 0.8 + 0.2*n);
    vec3 color = mix(hsv2rgb(hsv), vec3(1.0), n * 0.1); // 根據噪聲混合顏色
    return color;
}



// vec3 GasDisc(vec3 color, vec3 pos, float r){
//     float discRadius = 3.2;
//     float discWidth = 5.3;
//     float discInner = discRadius - discWidth * 0.5;
//     float discOuter = discRadius + discWidth * 0.5;
    
//     vec3 origin = vec3(0.0, 0.0, 0.0);
//     vec3 discNormal = normalize(vec3(0.0, 1.0, 0.0));
//     float discThickness = 0.1;

//     float distFromCenter = distance(pos, origin);
//     float distFromDisc = dot(discNormal, pos - origin);
    
//     float radialGradient = 1.0 - saturate((distFromCenter - discInner) / discWidth * 0.5);

//     float coverage = pcurve(radialGradient, 4.0, 0.9);

//     discThickness *= radialGradient;
//     coverage *= saturate(1.0 - abs(distFromDisc) / discThickness);

//     vec3 dustColorLit = vec3(1.0);
//     vec3 dustColorDark = vec3(0.0, 0.0, 0.0);

//     float dustGlow = 1.0 / (pow(1.0 - radialGradient, 2.0) * 290.0 + 0.002);
//     vec3 dustColor = dustColorLit * dustGlow * 8.2;

//     coverage = saturate(coverage * 0.7);


//     float fade = pow((abs(distFromCenter - discInner) + 0.4), 4.0) * 0.04;
//     float bloomFactor = 1.0 / (pow(distFromDisc, 2.0) * 40.0 + fade + 0.00002);
//     vec3 b = dustColorLit * pow(bloomFactor, 1.5);
    
//     b *= mix(vec3(1.7, 1.1, 1.0), vec3(0.5, 0.6, 1.0), vec3(pow(radialGradient, 2.0)));
//     b *= mix(vec3(1.7, 0.5, 0.1), vec3(1.0), vec3(pow(radialGradient, 0.5)));

//     dustColor = mix(dustColor, b * 150.0, saturate(1.0 - coverage * 1.0));
//     coverage = saturate(coverage + bloomFactor * bloomFactor * 0.1);
    
//     if (coverage < 0.01) {
//         return color;   
//     }
    
    
//     vec3 radialCoords;
//     radialCoords.x = distFromCenter * 1.5 + 0.55;
//     radialCoords.y = atan2(-pos.x, -pos.z) * 1.5;
//     radialCoords.z = distFromDisc * 1.5;

//     radialCoords *= 0.95;
    
//     float speed = 0.6;
    
//     float noise1 = 1.0;
//     vec3 rc = radialCoords + 0.0;               rc.y += iTime * speed;
//     noise1 *= noise(rc * 3.0) * 0.5 + 0.5;      rc.y -= iTime * speed;
//     noise1 *= noise(rc * 6.0) * 0.5 + 0.5;      rc.y += iTime * speed;
//     noise1 *= noise(rc * 12.0) * 0.5 + 0.5;     rc.y -= iTime * speed;
//     noise1 *= noise(rc * 24.0) * 0.5 + 0.5;     rc.y += iTime * speed;

//     float noise2 = 2.0;
//     rc = radialCoords + 30.0;
//     noise2 *= noise(rc * 3.0) * 0.5 + 0.5;      rc.y += iTime * speed;
//     noise2 *= noise(rc * 6.0) * 0.5 + 0.5;      rc.y -= iTime * speed;
//     noise2 *= noise(rc * 12.0) * 0.5 + 0.5;     rc.y += iTime * speed;
//     noise2 *= noise(rc * 24.0) * 0.5 + 0.5;     rc.y -= iTime * speed;
//     noise2 *= noise(rc * 48.0) * 0.5 + 0.5;     rc.y += iTime * speed;
//     noise2 *= noise(rc * 92.0) * 0.5 + 0.5;     rc.y -= iTime * speed;

//     dustColor *= noise1 * 0.998 + 0.002;
//     coverage *= noise2;
    
//     radialCoords.y += iTime * speed * 0.5;
    
//     dustColor *= pow(calculateTexture(pos, r), vec3(2.0)) * 4.0;

//     coverage = saturate(coverage * 1200.0 / 1000.0);
//     // coverage = saturate(coverage * 1200.0 / float(ITERATIONS));
//     dustColor = max(vec3(0.0), dustColor);

//     coverage *= pcurve(radialGradient, 4.0, 0.9);

//     color = dustColor * coverage + color;
//     return color;
// }

vec3 calculateColor(vec3 pos, float r, float distance){
    // float fogDensity = exp(-distance * 0.05);
    // vec3 fogColor = vec3(1.0, 1.0, 1.0);
    // vec3 diskTexture = calculateTexture(pos, r);

    // vec3 color = mix(diskTexture, fogColor, fogDensity);
    vec3 color = calculateTexture(pos,r);
    return color;
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
    float distance = 0.0;

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
        distance += r * dalpha;

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
            color = calculateColor(pos, r, distance);
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



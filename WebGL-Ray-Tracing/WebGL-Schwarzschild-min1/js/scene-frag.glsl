precision mediump float;

// uniform 
uniform float iTime;
uniform float polarAngle;
uniform float azimuthalAngle;
uniform float cameraDistance;
uniform int drawDisk;
uniform vec3 iResolution;
uniform sampler2D uSkysphere;

// Physics constant
const float PI = 3.1415925359;
const float TWO_PI = 6.2831850718;
const int MAX_STEPS = 4000;
const float DALPHA = 3.0*PI/float(MAX_STEPS);

const float GR_EFFECT = 1.0;

const float RS = 1.0; 
const float MIN_RADIUS = 3.0*RS;
const float MAX_RADIUS = 9.0*RS;

mat4 rotationMatrix(vec3 axis, float angle) {
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

float hash(float n) { 
    return fract(sin(n) * 43758.5453);
}

float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);

    float n = p.x + p.y * 57.0 + 113.0 * p.z;

    return mix(mix(mix( hash(n + 0.0), hash(n + 1.0), f.x),
                   mix( hash(n + 57.0), hash(n + 58.0), f.x), f.y),
               mix(mix( hash(n + 113.0), hash(n + 114.0), f.x),
                   mix( hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
}

vec3 adjustSaturation(vec3 color, float saturationFactor) {
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(vec3(luminance), color, saturationFactor);
}

vec3 interpolate5Colors(float r) {
    vec3 result;
    vec3 c1 = vec3(146.0,121.0,121.0);// rgb(146,121,121)
    vec3 c2 = vec3(200.0,120.0,100.0);// rgb(200,120,100)
    vec3 c3 = vec3(200.0,150.0,100.0);// rgb(200,150,100)
    vec3 c4 = vec3(220.0,155.0,65.0);// rgb(220,155,65)
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
vec3 calculateColor(vec3 pos, float rad, float phi, float distance, vec3 backgroundColor, float noise_rad_phi){
    // if(pos.z>0.0){ return vec3(1.0);}
    // else if(pos.z<0.0){ return vec3(0.5);}
    rad = clamp(rad, 0.0, 1.0);
    float color = noise_rad_phi;
    color *= exp(-distance * 0.01);
    color += 0.9 * rad;
    vec3 diskColor = interpolate5Colors(rad+0.2*noise_rad_phi) * 0.6 +  1.0 * color;
    diskColor = adjustSaturation(diskColor, 2.0);

    float alpha = rad*noise_rad_phi;
    alpha += 0.1 * rad;

    return mix(backgroundColor, diskColor, clamp(alpha, 0.0, 1.0));
}





// Ray 
struct Ray{
    vec3 origin;
    vec3 direction;
};

vec2 ODE(float x, vec2 U){
    return vec2(U.y, 1.5*U.x*U.x*GR_EFFECT - U.x);
}

vec2 RK1(float x, vec2 U, float h) {
    return U + ODE(x, U) * h;
}

vec3 RayMarching(Ray ray){
    vec3 color = vec3(0.0);
    vec3 pos = ray.origin;
    vec3 dir = ray.direction;
    vec3 pos_last = ray.origin;
    vec3 axisX = -ray.direction;
    vec3 axisY = normalize(cross(cross(ray.direction, ray.origin), ray.direction));

    float r = length(pos);
    float phi = 0.0;
    float alpha = 0.0;
    float alpha0 = PI - acos(dot(ray.direction, ray.origin)/r);
    float b = r * sin(alpha0);
    float dalpha = DALPHA;

    vec2 U = vec2(0.0, RS/b);

    bool isHit = false;
    bool isInside = true;

    float hitRad = 0.0;
    float hitPhi = 0.0;
    float hitDistance = 0.0;

    float noise_rad_phi = 0.0;
    float hit_noise_rad_phi = 0.0;

    for(int STEP=0; STEP<MAX_STEPS; STEP++){
        vec3 pos_last = pos;
        float r_last = r;
        U = RK1(alpha, U, dalpha);
        alpha += dalpha;
        r = RS/U.x;
        pos = r * axisX * cos(alpha) + r * axisY * sin(alpha);
        dir = normalize(pos - pos_last);
        
        if(!isHit){hitDistance += r * dalpha;}
        float rad = (r-MIN_RADIUS)/(MAX_RADIUS-MIN_RADIUS);
        phi = sign(pos.y)*acos(pos.x/sqrt(pos.x*pos.x+pos.y*pos.y));

        phi += iTime * 0.05;
        noise_rad_phi = noise(vec3(40.0*rad+cos(phi)));
        float Znoise = 0.005 * rad * noise_rad_phi;
        if( r > MIN_RADIUS && r < MAX_RADIUS && pos.z*pos_last.z < Znoise){
            if(!isHit){
                hit_noise_rad_phi = noise_rad_phi;
                hitRad = 1.0-rad;
                hitPhi = phi;
            }
            isHit = true;
        }
        // --- sheck over
        if( r * r_last < 0.0 ){
            isInside = false;
            break;
        }
    }
    
    dir = -dir.xyz;
    float azimuth = atan(dir.y, dir.x);
    float elevation = asin(dir.z);
    vec2 texCoords = vec2(azimuth / (2.0 * PI), elevation / PI) + 0.5;
    vec3 backgroundColor = texture2D(uSkysphere, texCoords).rgb.rgb * 0.499;
    if(drawDisk>0 && isHit){
        if(isInside){backgroundColor = vec3(0.0, 0.0, 0.0);}
        color = calculateColor(pos, hitRad, hitPhi, hitDistance, backgroundColor, hit_noise_rad_phi);
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
    vec2 screenPos = (2.0 * gl_FragCoord.xy - iResolution.xy) / iResolution.y;
    vec3 cameraPos = cameraDistance * vec3(
        sin(azimuthalAngle)*cos(polarAngle),
        sin(azimuthalAngle)*sin(polarAngle),
        cos(azimuthalAngle));
    vec3 cameraDir = normalize(vec3(0.0, 0.0, 0.0) - cameraPos); // camera point to origin
    vec3 cameraRight = normalize(cross(cameraDir, vec3(0.0, 0.0, 1.0)));
    vec3 cameraUp = cross(cameraRight, cameraDir);

    cameraUp = rotate(cameraUp, cameraDir, -0.2);
    cameraRight = cross(cameraDir, cameraUp);

    float cameraFOV = PI / 5.0;
    float fovFactor = tan(cameraFOV*0.5);
    vec3 rayDir = normalize(cameraDir + fovFactor * screenPos.x * cameraRight + fovFactor * screenPos.y * cameraUp);
    Ray ray = Ray(cameraPos, rayDir);
    // ray marching 
    vec3 color = RayMarching(ray);
    gl_FragColor = vec4(color, 1.0);
}



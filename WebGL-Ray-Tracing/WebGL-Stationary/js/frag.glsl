precision mediump float;

// uniform 
uniform float iTime;
uniform vec3 iResolution;

float tmp = 2.0*(cos(2.0*iTime) + 2.0);

// Camera parameters
vec3 cameraPos = vec3(0.0, 0.0, 10.0);
vec3 cameraDir = vec3(0.0, 0.0, -1.0);
vec3 cameraUp = vec3(0.0, 1.0, 0.0);
float cameraFOV = 3.14159 / 4.0; // 45 degrees

// Sphere parameters
vec3 sphereCenter = vec3(0.0, 0.0, 2.0);
float sphereRadius = 1.0;

// Light parameters
vec3 lightPos = vec3(10.0, 10.0, 10.0);
vec3 lightColor = vec3(1.0, 1.0, 1.0);

// Ray structure
struct Ray {
    vec3 origin;
    vec3 direction;
};

// Hit information
struct HitInfo {
    bool hit;
    float t;
    vec3 point;
    vec3 normal;
};

// Ray-sphere intersection
HitInfo intersectSphere(Ray ray, vec3 center, float radius) {
    HitInfo info;
    info.hit = false;

    vec3 oc = ray.origin - center;
    float a = dot(ray.direction, ray.direction);
    float b = 2.0 * dot(oc, ray.direction);
    float c = dot(oc, oc) - radius * radius;
    float discriminant = b * b - 4.0 * a * c;

    if (discriminant > 0.0) {
        float t1 = (-b - sqrt(discriminant)) / (2.0 * a);
        float t2 = (-b + sqrt(discriminant)) / (2.0 * a);
        info.t = min(t1, t2);
        info.point = ray.origin + info.t * ray.direction;
        info.normal = normalize(info.point - center);
        info.hit = true;
    }

    return info;
}

// Ray-plane intersection
HitInfo intersectPlane(Ray ray, vec3 normal, float d) {
    HitInfo info;
    info.hit = false;

    float denom = dot(ray.direction, normal);
    if (abs(denom) > 0.001) {
        float t = -(dot(ray.origin, normal) + d) / denom;
        if (t >= 0.0) {
            info.hit = true;
            info.t = t;
            info.point = ray.origin + t * ray.direction;
            info.normal = normal;
        }
    }

    return info;
}

// Calculate color based on hit information and light
vec3 calculateColor(HitInfo info, vec3 lightPos, vec3 lightColor) {
    vec3 color = vec3(0.0);
    if (info.hit) {
        vec3 toLight = normalize(lightPos - info.point);
        float diff = max(dot(info.normal, toLight), 0.0);
        color = diff * lightColor;
    }
    return color;
}

void main() {
    // Setup ray from camera
    vec2 screenPos = (gl_FragCoord.xy - iResolution.xy * 0.5) / iResolution.y;
    screenPos.x *= -1.0;

    vec3 cameraRight = normalize(cross(cameraUp, cameraDir));
    vec3 rayDir = normalize(cameraDir + cameraFOV * screenPos.x * cameraRight + cameraFOV * screenPos.y * cameraUp);
    Ray ray = Ray(cameraPos, rayDir);

    HitInfo sphereHit = intersectSphere(ray, sphereCenter, sphereRadius);
    HitInfo planeHit = intersectPlane(ray, vec3(0.0, 0.0, 1.0), 0.0);


    // Determine the closest hit
    vec3 color = vec3(1.0, 1.0, 1.0);
    if (sphereHit.hit && (!planeHit.hit || sphereHit.t < planeHit.t)) {
        color = calculateColor(sphereHit, lightPos, lightColor);
    } else if (planeHit.hit) {
        color = calculateColor(planeHit, lightPos, lightColor) * 0.5; // Darken the floor
    }

    gl_FragColor = vec4(color, 1.0);
}

precision mediump float;

float PI = 3.14159265358979323;

// uniform 
uniform float iTime;
uniform float polarAngle;
uniform float azimuthalAngle;
uniform float distance;
uniform vec3 iResolution;
uniform samplerCube uSkybox;

// Ray structure
struct Ray {
    vec3 origin;
    vec3 direction;
};

struct Material {
    vec3 color;
    vec3 ambientColor;
    float shininess;
    float reflectivity;
};

struct HitInfo {
    bool hit;
    float t;
    vec3 point;
    vec3 normal;
    Material material;
};

// Rotate
mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
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

// Ray-sphere intersection
HitInfo intersectSphere(Ray ray, vec3 center, float radius, Material material) {
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
        info.material = material;
    }

    return info;
}

// Ray-plane intersection
HitInfo intersectPlane(Ray ray, vec3 normal, float d, Material material) {
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
            info.material = material;
        }
    }

    return info;
}

// Ray-box intersection
HitInfo intersectBox(Ray ray, vec3 boxMin, vec3 boxMax, Material material) {
    HitInfo info;
    info.hit = false;
    info.t = -1.0;

    vec3 invDir = 1.0 / ray.direction;
    vec3 tMin = (boxMin - ray.origin) * invDir;
    vec3 tMax = (boxMax - ray.origin) * invDir;
    vec3 t1 = min(tMin, tMax);
    vec3 t2 = max(tMin, tMax);
    float tNear = max(max(t1.x, t1.y), t1.z);
    float tFar = min(min(t2.x, t2.y), t2.z);

    if (tNear > tFar || tFar < 0.0) {
        return info; // No intersection
    }

    info.hit = true;
    info.t = tNear > 0.0 ? tNear : tFar; // If tNear is negative, the ray started inside the box
    info.point = ray.origin + info.t * ray.direction;

    // Calculate normal
    vec3 tHit = tNear > 0.0 ? t1 : t2;
    info.normal = vec3(0.0);
    if (tHit.x > tHit.y && tHit.x > tHit.z) {
        info.normal.x = ray.direction.x < 0.0 ? 1.0 : -1.0;
    } else if (tHit.y > tHit.x && tHit.y > tHit.z) {
        info.normal.y = ray.direction.y < 0.0 ? 1.0 : -1.0;
    } else if (tHit.z > tHit.x && tHit.z > tHit.y) {
        info.normal.z = ray.direction.z < 0.0 ? 1.0 : -1.0;
    }
    info.material = material;
    return info;
}

vec3 calculateColor(HitInfo info, vec3 lightPos, vec3 lightColor, vec3 cameraPos) {
    vec3 color = vec3(0.0);
    if (info.hit) {
        // Diffuse lighting
        vec3 toLight = normalize(lightPos - info.point);
        float diff = max(dot(info.normal, toLight), 0.0);
        vec3 diffuse = diff * lightColor * info.material.color;

        // Specular lighting
        vec3 viewDir = normalize(cameraPos - info.point);
        vec3 reflectDir = reflect(-toLight, info.normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), info.material.shininess);
        vec3 specular = spec * lightColor;

        // Ambient lighting
        vec3 ambient = info.material.ambientColor * info.material.color;

        // Combine diffuse, specular, and ambient lighting
        color = diffuse + specular + ambient;
    }
    return color;
}

vec3 calculateReflection(HitInfo info, vec3 cameraPos, samplerCube skybox) {
    vec3 viewDir = normalize(cameraPos - info.point);
    vec3 reflectDir = reflect(-viewDir, info.normal);
    vec3 correctedDir = normalize(rotate(reflectDir, vec3(1.0, 0.0, 0.0), PI/2.0));
    vec3 reflectionColor = textureCube(skybox, correctedDir).rgb;
    return reflectionColor;
}


// Camera parameters
void main() {
    // Setup ray from camera
    vec2 screenPos = (gl_FragCoord.xy - iResolution.xy * 0.5) / iResolution.y;

    // Light parameters
    vec3 lightPos = vec3(10.0, 10.0, 10.0);
    vec3 lightColor = vec3(1.0, 1.0, 1.0);

    // camera 

    vec3 cameraPos = distance * vec3(
        sin(azimuthalAngle) * cos(polarAngle),
        sin(azimuthalAngle) * sin(polarAngle),
        cos(azimuthalAngle)
    );
    vec3 cameraDir = normalize(vec3(0.0, 0.0, 0.0) - cameraPos); // 相機指向原點
    vec3 globalUp = vec3(0.0, 0.0, 1.0);
    vec3 cameraRight = normalize(cross(cameraDir, globalUp));
    vec3 cameraUp = cross(cameraRight, cameraDir);
    float cameraFOV = PI / 2.0; // 45 degrees


    // Sphere parameters
    vec3 sphereCenter = vec3(0.0, 0.0, 0.0);
    float sphereRadius = 1.0;

    // Define box bounds
    vec3 boxMin = vec3(-3.0, -3.0, -1.5); // Minimum corner of the box
    vec3 boxMax = vec3(3.0, 3.0, -1.2); // Maximum corner of the box

    // Material properties
    Material sphereMaterial;
    sphereMaterial.color = vec3(0.9, 0.2, 0.2);
    sphereMaterial.ambientColor = vec3(0.1, 0.2, 0.5);
    sphereMaterial.shininess = 10.0;
    sphereMaterial.reflectivity = 0.2; // 0.0 ~ 1.0

    Material boxMaterial;
    boxMaterial.color = vec3(0.1, 0.1, 0.5);
    boxMaterial.ambientColor = vec3(0.1, 0.1, 0.9);
    boxMaterial.shininess = 10.0;
    boxMaterial.reflectivity = 0.99; // 0.0 ~ 1.0

    vec3 rayDir = normalize(cameraDir + (cameraFOV) * screenPos.x * cameraRight + (cameraFOV) * screenPos.y * cameraUp);
    Ray ray = Ray(cameraPos, rayDir);

    // Intersect with sphere and finite plane with distance capping
    HitInfo sphereHit = intersectSphere(ray, sphereCenter, sphereRadius, sphereMaterial);
    HitInfo boxHit = intersectBox(ray, boxMin, boxMax, boxMaterial);

     // Determine the closest hit and calculate color
    vec3 color = vec3(0.8, 0.6, 0.6); // Default color if no hit
    if (sphereHit.hit && (!boxHit.hit || sphereHit.t < boxHit.t)) {
        color = calculateColor(sphereHit, lightPos, lightColor, cameraPos);
        vec3 reflectionColor = calculateReflection(sphereHit, cameraPos, uSkybox);
        // 根据材料的反射率混合反射颜色和表面颜色
        color = mix(color, reflectionColor, sphereMaterial.reflectivity);
    } else if (boxHit.hit) {
        color = calculateColor(boxHit, lightPos, lightColor, cameraPos);
        vec3 reflectionColor = calculateReflection(boxHit, cameraPos, uSkybox);
        // 根据材料的反射率混合反射颜色和表面颜色
        color = mix(color, reflectionColor, boxMaterial.reflectivity);
    } else {
        // 如果没有击中任何物体，则显示天空盒
        vec3 correctedDir = normalize(rotate(rayDir, vec3(1.0, 0.0, 0.0), PI/2.0));
        color = textureCube(uSkybox, correctedDir).rgb;
    }


    gl_FragColor = vec4(color, 1.0);
}



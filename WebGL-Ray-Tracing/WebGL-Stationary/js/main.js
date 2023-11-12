const config = {
    resolution: 3,
    width: 800,
    height: 500,
};

// Vertex shader and fragment shader placeholders
let vertCode;
let fragCode;

// Fetch the shader source code
Promise.all([
    fetch("./js/vert.glsl").then(res => res.text()),
    fetch("./js/frag.glsl").then(res => res.text())
]).then(([vertexShaderSource, fragmentShaderSource]) => {
    vertCode = vertexShaderSource;
    fragCode = fragmentShaderSource;
    initWebGL();
}).catch(e => {
    console.error(e);
});

function initWebGL() {
    const canvas = document.getElementById('glcanvas');
    canvas.style.width = `${config.width}px`;
    canvas.style.height = `${config.height}px`;
    canvas.width = config.width * config.resolution;
    canvas.height = config.height * config.resolution;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    // Set up WebGL state, geometry, buffers, etc...
    // Create shaders
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    // Create program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    // Check for shader compile errors
    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertShader));
        return;
    }
    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragShader));
        return;
    }

    // Check for program linking errors
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(shaderProgram));
        return;
    }

    // Define vertices for a triangle (example)
    const vertices = new Float32Array([
        -1.0,  1.0,  // Top-left
         1.0,  1.0,  // Top-right
        -1.0, -1.0,  // Bottom-left
         1.0, -1.0,  // Bottom-right
    ]);

    // Define indices for the two triangles that make up the quad
    const indices = new Uint16Array([
        0, 1, 2, // First triangle
        2, 1, 3  // Second triangle
    ]);

    // Create a buffer object
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Create a buffer for the indices
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Get the attribute location
    const positionAttribLocation = gl.getAttribLocation(shaderProgram, 'aPosition');
    gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribLocation);

    const vertexCount = indices.length;

    // Start the render loop
    function render() {
        // Convert the time to seconds
        const iTime = performance.now()/1000.0; // seconds
        const iResolution = [
            config.width*config.resolution,  // need to mutiply resolution
            config.height*config.resolution, // need to mutiply resolution
            1.0];

        // Clear the canvas
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Set uniforms
        const iTimeLocation = gl.getUniformLocation(shaderProgram, 'iTime');
        gl.uniform1f(iTimeLocation, iTime);

        const iResolutionLocation = gl.getUniformLocation(shaderProgram, 'iResolution');
        gl.uniform3fv(iResolutionLocation, iResolution);

        // Draw the scene
        gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

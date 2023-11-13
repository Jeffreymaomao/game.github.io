const config = {
    canvasId: "app",
    resolution: 0.8,
    width: 600, 
    height: 400,
    fullscreen: false, // if fullscreen => ignore width and height
    skyboxURL: '../skybox/universe/skybox3.png',
    vertexShaderURL: "./js/vert.glsl",
    fragmentShaderURL: "./js/frag.glsl",
    camera: {
        distance: 15,
        polarAngle: 2.6,
        azimuthalAngle: 1.48,
    },
    mouse: {
        down: false,
        lastX: 0.0,
        lastY: 0.0,
        deltaX: 0.0,
        deltaY: 0.0,
    }
};
initCanvas();

// https://www.shadertoy.com/view/lstSRS

function initCanvas(){
    const canvas = document.getElementById(config.canvasId);
    if(config.fullscreen){
        config.width = window.innerWidth;
        config.height = window.innerHeight;
    }
    canvas.style.width = `${config.width}px`;
    canvas.style.height = `${config.height}px`;
    canvas.width = config.width * config.resolution;
    canvas.height = config.height * config.resolution;

    // Fetch the shader source code
    Promise.all([
        fetch(config.vertexShaderURL).then(res => res.text()),
        fetch(config.fragmentShaderURL).then(res => res.text())
    ]).then(([vertexShaderSource, fragmentShaderSource]) => {
        initWebGL(canvas, vertexShaderSource, fragmentShaderSource);
    }).catch(e => {
        console.error(e);
    });


    // if(config.fullscreen){
    //     window.addEventListener("resize",(e)=>{
    //         config.width = window.innerWidth;
    //         config.height = window.innerHeight;
    //         canvas.style.width = `${config.width}px`;
    //         canvas.style.height = `${config.height}px`;
    //         canvas.width = config.width * config.resolution;
    //         canvas.height = config.height * config.resolution;
    //     })
    // }
}

function initWebGL(canvas, vertCode, fragCode) {
    mouseEvent(canvas);

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
    const vertexCount = indices.length;

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

    const skyboxTexture = loadSkyboxFromCrossAtlas(gl,config.skyboxURL);
    const skyboxLocation = gl.getUniformLocation(shaderProgram, 'uSkybox');

    // Start the render loop
    function render() {
        // --- Convert the time to seconds
        const iTime = performance.now()/1000.0; // seconds
        const iResolution = [
            config.width*config.resolution,  // need to mutiply resolution
            config.height*config.resolution, // need to mutiply resolution
            1.0];
        // --- Clear the canvas
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // --- Set uniforms 
        // 1d float
        const iTimeLocation = gl.getUniformLocation(shaderProgram, 'iTime');
        gl.uniform1f(iTimeLocation, iTime);

        const polarAngleLocation = gl.getUniformLocation(shaderProgram, 'polarAngle');
        gl.uniform1f(polarAngleLocation, config.camera.polarAngle);

        const azimuthalAngleLocation = gl.getUniformLocation(shaderProgram, 'azimuthalAngle');
        gl.uniform1f(azimuthalAngleLocation, config.camera.azimuthalAngle);

        const distanceLocation = gl.getUniformLocation(shaderProgram, 'cameraDistance');
        gl.uniform1f(distanceLocation, config.camera.distance);

        // 2d array
        const iResolutionLocation = gl.getUniformLocation(shaderProgram, 'iResolution');
        gl.uniform3fv(iResolutionLocation, iResolution);

        // texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.uniform1i(skyboxLocation, 0); // 将纹理单元0传递给uniform变量

        // Draw the scene
        gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

function loadSkyboxFromCrossAtlas(gl, imageUrl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    const image = new Image();
    image.onload = () => {
        const faceSize = image.width / 4; // 假设图集宽度是高度的两倍
        const canvas = document.createElement('canvas');
        canvas.width = faceSize;
        canvas.height = faceSize;
        const context = canvas.getContext('2d');

        // 定义立方体贴图的每个面在图集中的位置
        const faces = [
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, x: 2 * faceSize, y: faceSize }, // 右
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, x: 0, y: faceSize }, // 左

            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, x: faceSize, y: 0 }, // 上
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, x: faceSize, y: 2 * faceSize }, // 下

            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, x: faceSize, y: faceSize }, // 前
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, x: 3 * faceSize, y: faceSize }, // 后
        ];

        faces.forEach(face => {
            context.drawImage(
                image,
                face.x, face.y, faceSize, faceSize, // 图集中的位置和大小
                0, 0, canvas.width, canvas.height // 画布上的位置和大小
            );
            gl.texImage2D(face.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        });

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };
    image.src = imageUrl;

    return texture;
}

function mouseEvent(canvas){
    canvas.addEventListener('mousedown', (e) => {
        config.mouse.down = true;
        config.mouse.lastX = e.clientX;
        config.mouse.lastY = e.clientY;
    });

    canvas.addEventListener('mouseleave', (e) => {
        config.mouse.down = false;
    });
    

    canvas.addEventListener('mouseup', () => {
        config.mouse.down = false;
    });
    canvas.addEventListener('mousemove', (e) => {
        if (config.mouse.down) {
            config.mouse.deltaX = e.clientX - config.mouse.lastX;
            config.mouse.deltaY = e.clientY - config.mouse.lastY;

            config.camera.polarAngle -= 0.005 * config.mouse.deltaX;
            config.camera.azimuthalAngle -= 0.005 * config.mouse.deltaY;

            config.camera.polarAngle%= 2*Math.PI;
            config.camera.azimuthalAngle = Math.max(0, Math.min(Math.PI, config.camera.azimuthalAngle));
            config.camera.azimuthalAngle = 0.9999*(config.camera.azimuthalAngle-Math.PI/2) + Math.PI/2

        }
        config.mouse.lastX = e.clientX;
        config.mouse.lastY = e.clientY;
    });

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        config.camera.distance += e.deltaY * 0.01;
        config.camera.distance = Math.max(0.01, Math.min(1000, config.camera.distance));
    });
}



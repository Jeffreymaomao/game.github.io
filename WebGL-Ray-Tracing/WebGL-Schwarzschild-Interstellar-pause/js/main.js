const config = {
    canvasId: "app",
    resolution: 1.0,
    width: 1136,
    height: 640,
    fullscreen: false, // if fullscreen => ignore width and height
    fullscreen: true, // if fullscreen => ignore width and height
    animate: false,
    skysphereURL: '../skysphere/reMilkyWay.png',

    sceneVertexShaderURL: "./js/scene-vert.glsl",
    sceneFragmentShaderURL: "./js/scene-frag.glsl",

    bloomVertexShaderURL: "./js/bloom-vert.glsl",
    bloomFragmentShaderURL: "./js/bloom-frag.glsl",

    finalVertexShaderURL: "./js/final-vert.glsl",
    finalFragmentShaderURL: "./js/final-frag.glsl",

    camera: {
        distance: 25,
        polarAngle: 2.6,
        azimuthalAngle: 1.45, //83 deg
        // azimuthalAngle: 1.52,
    },
    mouse: {
        down: false,
        lastX: 0.0,
        lastY: 0.0,
        deltaX: 0.0,
        deltaY: 0.0,
    },
    drawDisk: true,
};
initCanvas();

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
    mouseEvent(canvas);



    // Fetch the shader source code
    Promise.all([
        fetch(config.sceneVertexShaderURL).then(res => res.text()),
        fetch(config.sceneFragmentShaderURL).then(res => res.text()),
        fetch(config.bloomVertexShaderURL).then(res => res.text()),
        fetch(config.bloomFragmentShaderURL).then(res => res.text()),
        fetch(config.finalVertexShaderURL).then(res => res.text()),
        fetch(config.finalFragmentShaderURL).then(res => res.text())
    ]).then(([
        sceneVertexShaderURL,
        sceneFragmentShaderURL,
        bloomVertextShaderURL,
        bloomFragmentShaderURL,
        finalVertextShaderURL,
        finalFragmentShaderURL]) => {
        initWebGL(canvas, 
            sceneVertexShaderURL,
            sceneFragmentShaderURL,
            bloomVertextShaderURL,
            bloomFragmentShaderURL,
            finalVertextShaderURL,
            finalFragmentShaderURL);
    }).catch(e => {
        console.error(e);
    });
}

function createTexture(gl, width, height) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // 设置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return texture;
}

function attachTextureToFramebuffer(gl, framebuffer, texture) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
}


function initWebGL(canvas, sceneVertCode, sceneFragCode, bloomVertCode, bloomFragCode, finalVertCode, finalFragCode) {
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    // Create shaders
    const sceneVertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(sceneVertShader, sceneVertCode);
    gl.compileShader(sceneVertShader);
    const sceneFragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(sceneFragShader, sceneFragCode);
    gl.compileShader(sceneFragShader);

    const bloomVertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(bloomVertShader, bloomVertCode);
    gl.compileShader(bloomVertShader);
    const bloomFragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(bloomFragShader, bloomFragCode);
    gl.compileShader(bloomFragShader);

    const finalVertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(finalVertShader, finalVertCode);
    gl.compileShader(finalVertShader);
    const finalFragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(finalFragShader, finalFragCode);
    gl.compileShader(finalFragShader);

    

    // Create program
    const sceneShaderProgram = gl.createProgram();
    gl.attachShader(sceneShaderProgram, sceneVertShader);
    gl.attachShader(sceneShaderProgram, sceneFragShader);
    gl.linkProgram(sceneShaderProgram);

    const bloomShaderProgram = gl.createProgram();
    gl.attachShader(bloomShaderProgram, bloomVertShader);
    gl.attachShader(bloomShaderProgram, bloomFragShader);
    gl.linkProgram(bloomShaderProgram);

    const finalShaderProgram = gl.createProgram();
    gl.attachShader(finalShaderProgram, finalVertShader);
    gl.attachShader(finalShaderProgram, finalFragShader);
    gl.linkProgram(finalShaderProgram);

    // Check for shader compile errors
    if (!gl.getShaderParameter(sceneVertShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling sceneVertShader !', gl.getShaderInfoLog(sceneVertShader));
        return;
    }
    if (!gl.getShaderParameter(sceneFragShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling sceneFragShader !', gl.getShaderInfoLog(sceneFragShader));
        return;
    }
    if (!gl.getShaderParameter(bloomVertShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling bloomVertShader !', gl.getShaderInfoLog(bloomVertShader));
        return;
    }
    if (!gl.getShaderParameter(bloomFragShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling bloomFragShader !', gl.getShaderInfoLog(bloomFragShader));
        return;
    }
    if (!gl.getShaderParameter(finalVertShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling finalVertShader !', gl.getShaderInfoLog(finalVertShader));
        return;
    }
    if (!gl.getShaderParameter(finalFragShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling finalFragShader !', gl.getShaderInfoLog(finalFragShader));
        return;
    }

    

    // Check for program linking errors
    if (!gl.getProgramParameter(sceneShaderProgram, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(sceneShaderProgram));
        return;
    }
    if (!gl.getProgramParameter(bloomShaderProgram, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(bloomShaderProgram));
        return;
    }
    if (!gl.getProgramParameter(finalShaderProgram, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(finalShaderProgram));
        return;
    }


    let sceneFramebuffer = gl.createFramebuffer();
    let sceneTexture = createTexture(gl, canvas.width, canvas.height);
    attachTextureToFramebuffer(gl, sceneFramebuffer, sceneTexture);

    let bloomFramebuffer = gl.createFramebuffer();
    let bloomTexture = createTexture(gl, canvas.width, canvas.height);
    attachTextureToFramebuffer(gl, bloomFramebuffer, bloomTexture);


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
    const positionAttribLocationScene = gl.getAttribLocation(sceneShaderProgram, 'aPosition');
    gl.vertexAttribPointer(positionAttribLocationScene, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribLocationScene);

    const positionAttribLocationBloom = gl.getAttribLocation(bloomShaderProgram, 'aPosition');
    gl.vertexAttribPointer(positionAttribLocationBloom, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribLocationBloom);

    const positionAttribLocationFinal = gl.getAttribLocation(finalShaderProgram, 'aPosition');
    gl.vertexAttribPointer(positionAttribLocationFinal, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribLocationFinal);

    const skysphereTexture = loadSkysphereTexture(gl, config.skysphereURL);
    const skysphereLocation = gl.getUniformLocation(sceneShaderProgram, 'uSkysphere');

    // Start the render loop
    let azimuthalAngleAnimate = 0.00001;
    let polarAngleAnimate = 0.0001;
    function render() {
        if (!config.mouse.down) {
            config.camera.azimuthalAngle += azimuthalAngleAnimate;
            config.camera.polarAngle += polarAngleAnimate;
        }
        // Convert the time to seconds
        const iTime = performance.now()/1000.0; // seconds
        const iResolution = [config.width*config.resolution,config.height*config.resolution,1.0];
        // --- Clear the canvas ---
        // - scene buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFramebuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(sceneShaderProgram);
            // --- Set uniforms 

            // 1d float
            const iTimeLocationScene = gl.getUniformLocation(sceneShaderProgram, 'iTime');
            gl.uniform1f(iTimeLocationScene, iTime);

            const polarAngleLocationScene = gl.getUniformLocation(sceneShaderProgram, 'polarAngle');
            gl.uniform1f(polarAngleLocationScene, config.camera.polarAngle);

            const azimuthalAngleLocationScene = gl.getUniformLocation(sceneShaderProgram, 'azimuthalAngle');
            gl.uniform1f(azimuthalAngleLocationScene, config.camera.azimuthalAngle);

            const distanceLocationScene = gl.getUniformLocation(sceneShaderProgram, 'cameraDistance');
            gl.uniform1f(distanceLocationScene, config.camera.distance);

            const drawDiskLocationScene = gl.getUniformLocation(sceneShaderProgram, 'drawDisk');
            gl.uniform1i(drawDiskLocationScene, config.drawDisk);

            // 2d array
            const iResolutionLocationScene = gl.getUniformLocation(sceneShaderProgram, 'iResolution');
            gl.uniform3fv(iResolutionLocationScene, iResolution);

            // texture
            gl.activeTexture(gl.TEXTURE0);
            gl.uniform1i(skysphereLocation, 0); // 将纹理单元0传递给uniform变量
            gl.bindTexture(gl.TEXTURE_2D, skysphereTexture);

        gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0);

        // - bloom buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, bloomFramebuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(bloomShaderProgram);
            // 1d float
            const iResolutionLocationBloom = gl.getUniformLocation(bloomShaderProgram, 'iResolution');
            gl.uniform3fv(iResolutionLocationBloom, iResolution);

            // texture
            gl.uniform1i(gl.getUniformLocation(bloomShaderProgram, "uSceneTexture"), 0);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, sceneTexture);

        gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0);
        // --- Draw the final scene
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(finalShaderProgram);
            // 1d float 
            const iTimeLocationFinal = gl.getUniformLocation(finalShaderProgram, 'iTime');
            gl.uniform1f(iTimeLocationFinal, iTime);

        gl.uniform1i(gl.getUniformLocation(finalShaderProgram, "uSceneTexture"), 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sceneTexture);

        gl.uniform1i(gl.getUniformLocation(finalShaderProgram, "uBloomTexture"), 1);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, bloomTexture);

        gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0);

        if(config.animate){
            requestAnimationFrame(render);
        }
    }

    requestAnimationFrame(render);

    window.addEventListener("keydown",(e)=>{
        if(e.code=="Space"){
            config.animate = !config.animate;
            render();
        }
    })


    if(config.fullscreen){
        window.addEventListener('resize', (e)=>{
            if(config.animate){
                config.width = window.innerWidth;
                config.height = window.innerHeight;
                canvas.style.width = `${config.width}px`;
                canvas.style.height = `${config.height}px`;
                canvas.width = config.width * config.resolution;
                canvas.height = config.height * config.resolution;

                // 更新纹理和帧缓冲区
                sceneTexture = createTexture(gl, canvas.width, canvas.height);
                attachTextureToFramebuffer(gl, sceneFramebuffer, sceneTexture);
                bloomTexture = createTexture(gl, canvas.width, canvas.height);
                attachTextureToFramebuffer(gl, bloomFramebuffer, bloomTexture);

                // 更新 WebGL 视口
                gl.viewport(0, 0, canvas.width, canvas.height);
                render();   
            }
        });
    }

}

function loadSkyboxFromCrossAtlas(gl, imageUrl) {
    const texture = gl.createTexture();

    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        
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
        config.camera.distance += e.deltaY * 0.01;
        config.camera.distance = Math.max(6.28, Math.min(1000.0, config.camera.distance));
    }, { passive: true });
}

function loadSkysphereTexture(gl, imageUrl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    let notAnimate = false;
    if(!config.animate){
        config.animate = true;
        notAnimate = true;
    }

    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if(notAnimate){
            config.animate = false;
        }
    };
    image.src = imageUrl;

    return texture;
}





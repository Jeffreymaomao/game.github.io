const Rs = 50;

window.addEventListener("mousedown",()=>{document.body.classList.toggle('mousedown')})
window.addEventListener("mouseup",()=>{document.body.classList.toggle('mousedown')})

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function hsl2rgb(h, s, l) {
    var r, g, b;
    /** 
     * h : 0 ~ 360
     * s : 0 ~ 1
     * l : 0 ~ 1
     * 
     * r : 0 ~ 255
     * g : 0 ~ 255
     * b : 0 ~ 255
     * */
    h = h/360;

    function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p
    }
    if (s === 0) {
        r = g = b = l
    } else {
        var q = l < .5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3)
    }
    r *= 255;
    g *= 255;
    b *= 255;

    return [r,g,b]
}

function hsv2rgb(h, s, v) {
    /**
     * input argument:
     *  h: (  0  ~ 360 ) => hue
     *  s: (  0  ~  1  ) => saturation
     *  v: (  0  ~  1  ) => v
     * output argument:
     *  r: (  0  ~  1  ) => red
     *  g: (  0  ~  1  ) => green
     *  b: (  0  ~  1  ) => blue
     **/
    var h60 = h / 60.0;
    var h60f = Math.floor(h60);
    var hi = Math.ceil(h60f) % 6;
    var f = h60 - h60f;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    var r, g, b;
    if (hi == 0) {
        [r, g, b] = [v, t, p];
    } else if (hi == 1) {
        [r, g, b] = [q, v, p];
    } else if (hi == 2) {
        [r, g, b] = [p, v, t];
    } else if (hi == 3) {
        [r, g, b] = [p, q, v];
    } else if (hi == 4) {
        [r, g, b] = [t, p, v];
    } else if (hi == 5) {
        [r, g, b] = [v, p, q];
    }
    r *= 255;
    g *= 255;
    b *= 255;
    return [r, g, b]
}

function arange(start,stop,step){
    var arr = [];
    if(step===0){
        throw ': step can not be 0.';
    }
    if(stop>start){
        for(var element=start;element<stop;element+=step){
            arr.push(element)
        }
    }else{
        for(var element=start;element>stop;element-=step){
            arr.push(element)
        }
    }
    return arr;
}

function linspace(start, stop, n) {
  var arr = [];
  var step = (stop - start) / (n - 1);
  for (var i = 0; i < n; i++) {
    arr.push(start + (step * i));
  }
  return arr;
}

function rk4(func, t, y, h) {
    var N = y.length;
    let k1 = new Array(N);
    let k2 = new Array(N);
    let k3 = new Array(N);
    let k4 = new Array(N);
    let dydt = new Array(N);
    let ytemp = new Array(N);

    dydt = func(t, y);

    for (let i = 0; i < N; i++) {
        k1[i] = h * dydt[i];
        ytemp[i] = y[i] + 0.5 * k1[i];
    }

    dydt = func(t + 0.5 * h, ytemp);

    for (let i = 0; i < N; i++) {
        k2[i] = h * dydt[i];
        ytemp[i] = y[i] + 0.5 * k2[i];
    }

    dydt = func(t + 0.5 * h, ytemp);

    for (let i = 0; i < N; i++) {
        k3[i] = h * dydt[i];
        ytemp[i] = y[i] + k3[i];
    }

    dydt = func(t + h, ytemp);

    for (let i = 0; i < N; i++) {
        k4[i] = h * dydt[i];
        y[i] += (k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i]) / 6.0;
    }
    return ytemp
}

class Axis{
    constructor(length=2*Rs){
        this.length = length;
        this.labelx;
        this.labely;
        this.labelz;
    }
    draw(){
        strokeWeight(2);
        colorMode(RGB, 255,255,255,1);
        var label_pos,x_,y_;
        // x-axis
        stroke(255,0,0);
        line(0,0,0, this.length,0,0);
        if(this.labelx){
            label_pos = screenPosition(this.length,0,0);
            x_ = label_pos.x + windowWidth/2
            y_ = label_pos.y + windowHeight/2
            this.labelx.position(x_,y_);
        }
        
        // y-axis
        stroke(0,255,0);
        line(0,0,0, 0,-this.length,0);
        if(this.labely){
            label_pos = screenPosition(0,-this.length,0);
            x_ = label_pos.x + windowWidth/2
            y_ = label_pos.y + windowHeight/2
            this.labely.position(x_,y_);
        }
        
        // z-axis
        stroke(0,0,255);
        line(0,0,0, 0,0,this.length);
        if(this.labelz){
            label_pos = screenPosition(0,0,this.length);
            x_ = label_pos.x + windowWidth/2
            y_ = label_pos.y + windowHeight/2
            this.labelz.position(x_,y_);
        }
    }
}

class BlackHole{
    constructor(vec3){
        this.pos = [-5*Rs, 0, 0]
        this.label;

    }
    update(){
        this.Angle0 = (this.Angle0+0.05)%(2*PI);
    }
    draw(){
        const pos = this.pos;
        noStroke();
        translate(pos[0], pos[1], pos[2]);
        fill(100);
        sphere(Rs);
        translate(-pos[0], -pos[1], -pos[2]);
        if(this.label){
            var label_pos = screenPosition(this.pos);
            var x_ = label_pos.x + windowWidth/2
            var y_ = label_pos.y + windowHeight/2
            this.label.position(x_,y_);
        }
    }
}

class AccretionDisk{
    constructor(blackhole){
        this.pos = blackhole.pos
        this.range = [2.6*Rs, 4*Rs];
        this.n = 100;
        this.i = Array(this.n);
        this.color = Array(this.n);
        this.startAngle = Array(this.n);
        this.endAngle = Array(this.n);
        this.Angle0 = 0;
        for(var i=0;i<=this.n;i++){
            var hue = 50*Math.random();
            var angle = [Math.random(), Math.random()]
            this.color[i] = hsv2rgb(hue,1,1.0 - 0.5*Math.random());
            this.i[i] = Math.random();
            this.startAngle[i] = 4*Math.PI*Math.min(angle[0],angle[1])
            this.endAngle[i] = 4*Math.PI*Math.max(angle[0],angle[1]);
        }
        this.label;
        this.lineWidth = 0.8;

    }
    update(){
        this.Angle0 = (this.Angle0+0.05)%(2*PI);
    }
    draw(){
        const pos = this.pos;
        const deltaAngle = 0.5;
        const range = this.range;
        noStroke();
        translate(pos[0], pos[1], pos[2]);
        rotateY(deltaAngle);
        
        noFill();
        strokeWeight(this.lineWidth);
        for(var i=0;i<=this.n;i++){
            var c = this.color[i];
            var rad_ = 2*range[0] + 2*this.i[i]*(range[1]-range[0])
            stroke(c[0],c[1],c[2]);
            arc(0,0,rad_,rad_,this.Angle0+this.startAngle[i],this.Angle0+this.endAngle[i]);
        }
        translate(-pos[0], -pos[1], -pos[2]);
        if(this.label){
            var [x,y,z] = this.pos;
            x += range[1]*Math.cos(this.Angle0+PI);
            y += range[1]*Math.sin(this.Angle0+PI);
            var label_pos = screenPosition(x,y,z);
            var x_ = label_pos.x + windowWidth/2
            var y_ = label_pos.y + windowHeight/2
            this.label.position(x_,y_);
        }
        rotateY(-deltaAngle);
    }
}

class ImagePlane{
    constructor(nHeight,nWidth){
        this.Height  = 64*Rs/10;
        this.Width   = 128*Rs/10;
        if(nWidth){this.nHeight = nHeight;}else{this.nHeight = 10;}
        if(nWidth){this.nWidth  = nWidth;}else{this.nWidth = 10;}
        this.deltaY  = this.Height/this.nHeight;
        this.deltaX  = this.Width/this.nWidth;
        this.lineWidth = 0.2;
        this.label;
    }
    draw(){
        rotateY(PI/2);
        rotateZ(PI/2);

        stroke(255,255,255);
        noFill();
        strokeWeight(this.lineWidth);
        for(var iw=0;iw<this.nWidth;iw++){
            for(var ih=0;ih<this.nHeight;ih++){
                rect(-this.Width/2+iw*this.deltaX, -this.Height/2+ih*this.deltaY, this.deltaX, this.deltaY);
            }
        }
        rotateZ(-PI/2);
        rotateY(-PI/2);
        if(this.label){
            var label_pos = screenPosition(0,-this.Width/2,this.Height/2);
            var x_ = label_pos.x + windowWidth/2
            var y_ = label_pos.y + windowHeight/2
            this.label.position(x_,y_);
        }
    }
}

class Observer{
    constructor(imageplane, t_end=2){
        this.pos = [10*Rs, 0, 0];
        this.t_end = t_end;
        this.imageplane = imageplane;
        this.lineWidth = 0.2;
        this.label;
        this.label_pos;
        this.IsDrawLine = false;
    }
    draw(){
        const pos = this.pos;
        const imageplane = this.imageplane;
        const t_end = this.t_end;
        const Height = imageplane.Height;
        const Width = imageplane.Width;
        const list = [1,-1];
        strokeWeight(5);
        stroke(255)
        point(pos[0],pos[1],pos[2]);
        if(this.IsDrawLine){
            for(var i=0;i<2;i++){
                for(var j=0;j<2;j++){
                    var x_ = pos[0] + t_end * ( - pos[0]);
                    var y_ = pos[2] + t_end * (Width/2 - pos[2]);
                    var z_ = pos[1] + t_end * (Height/2 - pos[1]);
                    strokeWeight(this.lineWidth);
                    line(pos[0],pos[1],pos[2], x_, list[j]*y_, list[i]*z_);
                }   
            }
        }
        if(this.label){
            var label_pos = screenPosition(this.pos);
            var x_ = label_pos.x + windowWidth/2
            var y_ = label_pos.y + windowHeight/2
            this.label.position(x_,y_);
        }
    }
}

class Photon{
    constructor(x,y, blackhole,observer, ImagePlane, lineWidth=0.3){
        if(x){this.x_img_p = x;}else{this.x_img_p = 0;}
        if(y){this.y_img_p = y;}else{this.y_img_p = 0;}
        this.observer = observer;
        this.blackhole = blackhole;
        this.ImagePlane = ImagePlane;
        this.centerX = this.ImagePlane.Height/2;
        this.centerY = this.ImagePlane.Width/2;
        this.x_img = 0;
        this.y_img = 0;
        this.pos2img();

        this.IsDrawRay = false;
        this.IsDrawPath = true;
        this.lineWidth = lineWidth;

        /** numerical value */
        this.pos2bh = Math.abs(this.observer.pos[0]) + Math.abs(this.blackhole.pos[0]);
        this.pos2org = this.observer.pos[0];
        this.img2org = Math.sqrt(this.x_img**2 + this.y_img**2)
        this.theta = Math.atan2(this.y_img,this.x_img);
        this.phi0 = Math.atan2(this.img2org,this.pos2org);
        this.dphi = 0.02;
        this.phi_end = 2*Math.PI;
        this.phi = arange(0,this.phi_end, this.dphi);
        this.U0 = [0,0];
        this.U = [0,0];

        this.n = this.phi.length;
        this.r = linspace(0,0,this.n);
        this.x = linspace(0,0,this.n);
        this.y = linspace(0,0,this.n);
        this.z = linspace(0,0,this.n);
        this.solveODE();

        
    }
    F(phi, U){
        var F0 = U[1];
        var F1 = 1.5 * U[0]**2 - U[0];
        // var F1 = - U[0];
        return [F0,F1];
    }
    solveODE(){
        this.b = (this.pos2bh*Math.sin(this.phi0))/Rs;
        this.U0 = [0, 1/Math.abs(this.b)];
        this.U = this.U0;
        /** Solving the ODE by the Classical Runge Kutta method*/
        for(var i=0;i<this.n;i++){
            this.U = rk4(this.F, this.phi[i], this.U, this.dphi);
            this.r[i] = 1/this.U[0];
            if(isNaN(this.r[i])){this.r[i]=0}
        }
        /** Transfer from Polar coordinate to Cartesian coordinate*/
        var changePhase = false;
        for(var i=0;i<this.n;i++){
            if(this.phi[i]<this.phi0){
                this.phi[i] = this.phi0;
                this.r[i] = this.pos2bh/Rs;
            }
            if(changePhase){this.r[i]=1e10;}
            this.x[i] = this.r[i] * Rs * Math.cos(this.phi[i]-this.phi0);
            this.y[i] = this.r[i] * Rs * Math.sin(this.phi[i]-this.phi0) * Math.sin(this.theta);
            this.z[i] = this.r[i] * Rs * Math.sin(this.phi[i]-this.phi0) * Math.cos(this.theta) ;
            if(this.r[i]*this.r[i+1]<0){changePhase = true;}
        }
    }
    drawPath(){
        var x = this.x
        var y = this.z
        var z = this.y
        for(var i=1;i<this.n;i++){
            line(x[i-1],y[i-1],z[i-1],x[i],y[i],z[i])
        }
    }
    pos2img(){
        const deltaX = this.ImagePlane.deltaX;
        const deltaY = this.ImagePlane.deltaY;
        const Height = this.ImagePlane.Height;
        const Width = this.ImagePlane.Width;
        const nHeight = this.ImagePlane.nHeight;
        const nWidth = this.ImagePlane.nWidth;
        this.x_img_p = this.x_img_p%nWidth + 1;
        this.y_img_p = this.y_img_p%nHeight + 1;
        this.x_img = Width/2 + deltaX/2 - deltaX * this.x_img_p;
        this.y_img = Height/2 + deltaY/2 - deltaY * this.y_img_p;
    }
    draw(){
        const blackhole = this.blackhole;
        stroke(255,255,0);
        strokeWeight(this.lineWidth);
        
        if(this.IsDrawRay){
            rotateY(PI/2);
            rotateZ(PI/2);
            strokeWeight(2);
            point(this.x_img,this.y_img,0);
            strokeWeight(0.5);
            line(0,0,this.observer.pos[0],this.x_img,this.y_img,0)
            rotateZ(-PI/2);
            rotateY(-PI/2);
        }
        if(this.IsDrawPath){
            translate(this.blackhole.pos[0], 0 , 0);
            this.drawPath();
            translate(-this.blackhole.pos[0], 0 , 0);
        }

    }
}

class Photons{
    constructor(n,blackhole,observer, imageplane, lineWidth=0.3){
        this.n = n;
        this.photon = Array(this.n-1);
        this.scaleIndex = imageplane.nWidth*imageplane.nHeight/this.n;
        for(var i=0;i<this.n;i++){
            var x = Math.floor((this.scaleIndex*i)/(2*imageplane.nWidth));
            var y = ((this.scaleIndex*i)%(2*imageplane.nWidth));
            this.photon[i] = new Photon(x,y,blackhole,observer, imageplane, lineWidth);
        }
    }
    draw(){
        for(var i=0;i<this.n;i++){
            this.photon[i].draw();
        }
    }
}

function animationRotate(){
    const speed = 0.5;
    rotateZ(frameCount * speed * 0.01);
    // rotateY(0.2*sin(frameCount * speed * 0.01));
    scale(0.8 + 0.3*sin(frameCount * speed * 0.01));
    translate(-blackhole.pos[0],0,0);
}

const configuration = {
    "image":{
        "height": 8,
        "width": 4
    },
    "photon":{
        "number": 20,
        "lineWidth": 0.3
    }
}

const axis = new Axis();
const imageplane = new ImagePlane(configuration.image.height,configuration.image.width);
const blackhole = new BlackHole();
const accretiondisk = new AccretionDisk(blackhole);
const observer = new Observer(imageplane);
const photons = new Photons(configuration.photon.number,blackhole,observer, imageplane,configuration.photon.lineWidth);
let label_observer; 

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    colorMode(RGB, 255,255,255,1);
    curveDetail(5);
    addScreenPositionFunction();
    console.clear();
    // noLoop();

    /** label setting */
    observer.label = createDiv("Observer");
    blackhole.label = createDiv("Black Hole");
    accretiondisk.label = createDiv("Accretion Disk")
    imageplane.label = createDiv("Image Plane")
    axis.labelx = createDiv("<var>x<var>");
    axis.labely = createDiv("<var>y<var>");
    axis.labelz = createDiv("<var>z<var>");
    axis.labelx.style('color', 'rgb(255,0,0)');
    axis.labely.style('color', 'rgb(0,255,0)');
    axis.labelz.style('color', 'rgb(0,0,255)');
    const labels = [axis.labelx, axis.labely, axis.labelz];
    for(var i=0;i<labels.length;i++){
        labels[i].class("mq-math-mode")
    }
}
function draw() {
    background(0, 0, 0);
    orbitControl(1.2, 1.2, 0.01);
    rotateZ(PI/2);
    rotateY(-PI/2);
    
    // rotateZ(frameCount/500);

    rotateZ(-PI/2-0.1);
    rotateY(0.3);


    scale(1.0);
    pointLight(255, 255, 255, 1000, -1000, 1000);

    // axis.draw();
    observer.draw();
    photons.draw();
    imageplane.draw();
    blackhole.draw();
    accretiondisk.draw();
}


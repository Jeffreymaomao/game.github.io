var mouse = { x: 100, y: 100 };
const G = 6.6743e-11; // m^3 / kg / s^2
const c = 299792458;  // m / s  
var meter2pixel = 70;
var pixel2meter = 1/meter2pixel;
var Rs = 1;


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
    var h60f = floor(h60);
    var hi = ceil(h60f) % 6;
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
/** ---------------------------------------------------------------------------- */
class grapher {
    constructor(id, scale, scaleMax, width, height) {
        if(scale<0.005){scale=0.005};
        this.id = id;
        this.canvas = document.getElementById(this.id);
        this.ctx = this.canvas.getContext("2d");
        this.scale = scale;
        this.scaleMax = scaleMax;
        this.width = width;
        this.height = height;

        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.canvas.width = parseInt(this.canvas.style.width) * this.scale;
        this.canvas.height = parseInt(this.canvas.style.height) * this.scale;
        this.center = {
            x: this.width / 2,
            y: this.height / 2,
            max: max(this.width / 2, this.height / 2)
        }
        this.canvas.center = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            max: max(this.canvas.width / 2, this.canvas.height / 2)
        }
        // this.canvas.style.imageRendering = 'crisp-edges';
        this.canvas.style.imageRendering = 'pixelated';
        this.canvas.addEventListener('mousemove', function(e) {
            var rect = this.getBoundingClientRect();
            // var cssScaleX = this.width / this.offsetWidth;
            // var cssScaleY = this.height / this.offsetHeight;
            // mouse.x = (e.clientX - rect.x) * cssScaleX;
            // mouse.y = (e.clientY - rect.y) * cssScaleY;
            mouse.x = (e.clientX - rect.x);
            mouse.y = (e.clientY - rect.y);
        });
    }
    resize(width,height){
        this.scale = 0.5;
        this.width = width;
        this.height = height;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.canvas.width = parseInt(this.canvas.style.width) * this.scale;
        this.canvas.height = parseInt(this.canvas.style.height) * this.scale;
        this.center = {
            x: this.width / 2,
            y: this.height / 2,
            max: max(this.width / 2, this.height / 2)
        }
        this.canvas.center = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            max: max(this.canvas.width / 2, this.canvas.height / 2)
        }
    }
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    changeResolution() {
    	if(this.scale<0.005){this.scale=0.005};
        this.scale = this.scale + 0.01;
        this.canvas.width = parseInt(this.canvas.style.width) * this.scale;
        this.canvas.height = parseInt(this.canvas.style.height) * this.scale;
        this.canvas.center = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            max: max(this.canvas.width / 2, this.canvas.height / 2)
        }
    }
    update(){
        if(this.scale<this.scaleMax){
            this.changeResolution();
        }
    }
}

class circle{
    /*new circle(grapher, 500, 500, 100)*/
    constructor(grapher, x, y, radius, strokeStyle, fillStyle, lineWidth=1){
        this.grapher = grapher;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.strokeStyle = undefined;
        this.fillStyle = undefined;
        if(strokeStyle){
            this.strokeStyle = strokeStyle;
        }
        if(fillStyle){
            this.fillStyle = fillStyle;
        }        
        this.lineWidth = lineWidth;
    }
    draw(){
        this.grapher.ctx.strokeStyle = this.strokeStyle;
        this.grapher.ctx.fillStyle = this.fillStyle;
        this.grapher.ctx.lineWidth = this.lineWidth * this.grapher.scale;
        this.grapher.ctx.beginPath();
        this.grapher.ctx.arc(this.x*this.grapher.scale, this.y*this.grapher.scale, this.radius*this.grapher.scale, 0, pi*2);
        this.grapher.ctx.closePath();
        this.grapher.ctx.stroke();
        this.grapher.ctx.fill();
    }
    update(){
        this.x = this.grapher.center.x;
        this.y = this.grapher.center.y;
    }

}
class arrow{
    /* new arrow(grapher, 100,100,30,30,100,10,'#fff') */
    constructor(grapher, x, y, dirx, diry, color){
        this.grapher = grapher;
        this.x = x;
        this.y = y;
        this.dirx = dirx;
        this.diry = diry;
        this.length = sqrt(this.dirx**2+this.diry**2);
        this.width = 3;
        this.headlen = 10;
        this.color = color;
        this.endx = this.x + this.dirx;
        this.endy = this.y + this.diry;
        this.angle = atan2(this.diry,this.dirx);
    }
    drawVector(x,y,dirx,diry, headlen, width){
        var endx = x + dirx;
        var endy = y + diry;
        this.grapher.ctx.save();
        this.grapher.ctx.fillStyle = this.color;
        this.grapher.ctx.strokeStyle = this.color;
     
        //starting path of the arrow from the start square to the end square
        //and drawing the stroke
        this.grapher.ctx.beginPath();
        this.grapher.ctx.moveTo(x, y);
        this.grapher.ctx.lineTo(endx, endy);
        this.grapher.ctx.lineWidth = width;
        this.grapher.ctx.stroke();
     
        //starting a new path from the head of the arrow to one of the sides of
        //the point
        this.grapher.ctx.beginPath();
        this.grapher.ctx.moveTo(endx, endy);
        this.grapher.ctx.lineTo(endx-headlen*cos(this.angle-pi/7),
                   endy-headlen*sin(this.angle-pi/7));
     
        //path from the side point of the arrow, to the other side point
        this.grapher.ctx.lineTo(endx-headlen*cos(this.angle+pi/7),
                   endy-headlen*sin(this.angle+pi/7));
     
        //path from the side point back to the tip of the arrow, and then
        //again to the opposite side point
        this.grapher.ctx.lineTo(endx, endy);
        this.grapher.ctx.lineTo(endx-headlen*cos(this.angle-pi/7),
                   endy-headlen*sin(this.angle-pi/7));
     
        this.grapher.ctx.closePath();
        //draws the paths created above
        this.grapher.ctx.stroke();
        this.grapher.ctx.restore();
    }
    draw(){
        this.drawVector(
            this.x * this.grapher.scale,
            this.y * this.grapher.scale,
            this.dirx * this.grapher.scale,
            this.diry * this.grapher.scale,
            this.headlen * this.grapher.scale,
            this.width * this.grapher.scale);
    }
    update(){
        this.x = mouse.x;
        this.y = mouse.y;
        this.endx = this.x + this.dirx;
        this.endy = this.y + this.diry;
        this.angle = atan2(this.diry, this.dirx);
    }
}

/** ---------------------------------------------------------------------------- */
class blackhole {
    constructor(grapher) {
        this.grapher = grapher;
        this.x = this.grapher.center.x;
        this.y = this.grapher.center.y;
        this.Rs = Rs;
        this.mass = Rs*c**2/2*G;
        this.radius = Rs*meter2pixel;
        console.log("Schwarzschild radius =", this.Rs, "\t\t(m)")
        console.log("                     =", this.radius, "\t\t(pixels)")
        this.strokeStyle = 'black';
        this.fillStyle = 'black';
    }
    draw() {
        this.grapher.ctx.strokeStyle = this.strokeStyle;
        this.grapher.ctx.fillStyle = this.fillStyle;
        this.grapher.ctx.lineWidth = this.lineWidth * this.grapher.scale;
        this.grapher.ctx.beginPath();
        this.grapher.ctx.arc(this.x*this.grapher.scale, this.y*this.grapher.scale, this.radius*this.grapher.scale, 0, pi*2);
        this.grapher.ctx.closePath();
        this.grapher.ctx.stroke();
        this.grapher.ctx.fill();
    }
    update(){
        this.x = this.grapher.center.x;
        this.y = this.grapher.center.y;
    }
}
class photon {
    constructor(grapher, blackhole, x0, y0, phi_end=3*pi, strokeStyle='#f6be00') {
        this.grapher = grapher;
        this.blackhole = blackhole;
        this.x0 = x0;
        this.y0 = y0;
        this.b = this.y0 * pixel2meter;
        this.phi_end = phi_end;
        if(phi_end){
            this.phi_end = phi_end;
        }
        this.dphi = 0.01;
        this.phi = arange(0, phi_end, this.dphi);
        this.U0 = [0, this.b];
        this.U = [0,0];

        this.n = this.phi.length;
        this.r = linspace(0,0,this.n);
        this.x = linspace(x0,x0,this.n);
        this.y = linspace(y0,y0,this.n);
        /* ----------------------- */
        this.updatePos1(y0);
        this.strokeStyle = strokeStyle;
        this.lineWidth = 2;
    }
    F(phi, U){
        var F0 = U[1];
        var F1 = 1.5 * Rs * U[0]**2 - U[0];
        // var F1 = - U[0];
        return [F0,F1];
    }
    u(phi){
        /**
         * numerical approximation
         **/
        return sin(phi)/this.b - Rs/this.b**2/4 * (3 + 4*cos(phi) + cos(2*phi));
        // return sin(phi)/this.b; // neglect gravitational lensing
    }
    drawSeg1() {
        this.grapher.ctx.strokeStyle = this.strokeStyle;
        this.grapher.ctx.fillStyle = this.strokeStyle;
        this.grapher.ctx.lineWidth = this.grapher.scale * this.lineWidth;
        this.grapher.ctx.beginPath();
        for(var i=0;i<this.n;i++){
            this.grapher.ctx.lineTo(
                    this.grapher.scale * (this.x[i]+this.grapher.center.x),
                    this.grapher.scale * (this.y[i]+this.grapher.center.y)
                );
        }
        this.grapher.ctx.stroke();
        this.grapher.ctx.closePath();
    }
    drawSeg2() {
        this.grapher.ctx.strokeStyle = this.strokeStyle;
        this.grapher.ctx.fillStyle = this.strokeStyle;
        this.grapher.ctx.lineWidth = this.grapher.scale * this.lineWidth;
        /** ---------------------------------------------------------------------------- */
        this.grapher.ctx.beginPath();
        for(var i=0;i<floor(this.n/2);i++){
            this.grapher.ctx.lineTo(
                    this.grapher.scale * (this.x[i]+this.grapher.center.x),
                    this.grapher.scale * (this.y[i]+this.grapher.center.y)
                );
        }
        this.grapher.ctx.stroke();
        this.grapher.ctx.closePath();

        /** ---------------------------------------------------------------------------- */
        this.grapher.ctx.beginPath();
        for(var i=ceil(this.n/2);i<this.n;i++){
            this.grapher.ctx.lineTo(
                    this.grapher.scale * (this.x[i]+this.grapher.center.x),
                    this.grapher.scale * (this.y[i]+this.grapher.center.y)
                );
        }
        this.grapher.ctx.stroke();
        this.grapher.ctx.closePath();
    }
    drawSeg4() {
        this.grapher.ctx.strokeStyle = this.strokeStyle;
        this.grapher.ctx.fillStyle = this.strokeStyle;
        this.grapher.ctx.lineWidth = this.grapher.scale * this.lineWidth;
        /** ---------------------------------------------------------------------------- */
        this.grapher.ctx.beginPath();
        for(var i=0;i<floor(this.n/4);i++){
            this.grapher.ctx.lineTo(
                    this.grapher.scale * (this.x[i]+this.grapher.center.x),
                    this.grapher.scale * (this.y[i]+this.grapher.center.y)
                );
        }
        this.grapher.ctx.stroke();
        this.grapher.ctx.closePath();

        /** ---------------------------------------------------------------------------- */
        this.grapher.ctx.beginPath();
        for(var i=ceil(this.n/4);i<floor(2*this.n/4);i++){
            this.grapher.ctx.lineTo(
                    this.grapher.scale * (this.x[i]+this.grapher.center.x),
                    this.grapher.scale * (this.y[i]+this.grapher.center.y)
                );
        }
        this.grapher.ctx.stroke();
        this.grapher.ctx.closePath();
        /** ---------------------------------------------------------------------------- */
        this.grapher.ctx.beginPath();
        for(var i=ceil(2*this.n/4);i<floor(3*this.n/4);i++){
            this.grapher.ctx.lineTo(
                    this.grapher.scale * (this.x[i]+this.grapher.center.x),
                    this.grapher.scale * (this.y[i]+this.grapher.center.y)
                );
        }
        this.grapher.ctx.stroke();
        this.grapher.ctx.closePath();

        /** ---------------------------------------------------------------------------- */
        this.grapher.ctx.beginPath();
        for(var i=ceil(2*this.n/4);i<this.n;i++){
            this.grapher.ctx.lineTo(
                    this.grapher.scale * (this.x[i]+this.grapher.center.x),
                    this.grapher.scale * (this.y[i]+this.grapher.center.y)
                );
        }
        this.grapher.ctx.stroke();
        this.grapher.ctx.closePath();
        
    }
    drawSeg8() {
        this.grapher.ctx.strokeStyle = this.strokeStyle;
        this.grapher.ctx.fillStyle = this.strokeStyle;
        this.grapher.ctx.lineWidth = this.grapher.scale * this.lineWidth;
        /** ---------------------------------------------------------------------------- */
        this.grapher.ctx.strokeStyle = 'hsl(0,100%,50%)'
        this.grapher.ctx.beginPath();
        for(var i=0;i<floor(this.n/8);i++){
            this.grapher.ctx.lineTo(
                    this.grapher.scale * (this.x[i]+this.grapher.center.x),
                    this.grapher.scale * (this.y[i]+this.grapher.center.y)
                );
        }
        this.grapher.ctx.stroke();
        this.grapher.ctx.closePath();
        /** ---------------------------------------------------------------------------- */
        this.grapher.ctx.strokeStyle = 'hsl(30,100%,50%)'
        this.grapher.ctx.beginPath();
        for(var i=ceil(this.n/8);i<floor(2*this.n/8);i++){
            this.grapher.ctx.lineTo(
                    this.grapher.scale * (this.x[i]+this.grapher.center.x),
                    this.grapher.scale * (this.y[i]+this.grapher.center.y)
                );
        }
        this.grapher.ctx.stroke();
        this.grapher.ctx.closePath();
        /** ---------------------------------------------------------------------------- */
        this.grapher.ctx.strokeStyle = 'hsl(60,100%,50%)'
        this.grapher.ctx.beginPath();
        for(var i=ceil(2*this.n/8);i<floor(3*this.n/8);i++){
            this.grapher.ctx.lineTo(
                    this.grapher.scale * (this.x[i]+this.grapher.center.x),
                    this.grapher.scale * (this.y[i]+this.grapher.center.y)
                );
        }
        this.grapher.ctx.stroke();
        this.grapher.ctx.closePath();
        /** ---------------------------------------------------------------------------- */
        this.grapher.ctx.strokeStyle = 'hsl(90,100%,50%)'
        this.grapher.ctx.beginPath();
        for(var i=ceil(3*this.n/8);i<floor(4*this.n/8);i++){
            this.grapher.ctx.lineTo(
                    this.grapher.scale * (this.x[i]+this.grapher.center.x),
                    this.grapher.scale * (this.y[i]+this.grapher.center.y)
                );
        }
        this.grapher.ctx.stroke();
        this.grapher.ctx.closePath();
        /** ---------------------------------------------------------------------------- */
        this.grapher.ctx.strokeStyle = 'hsl(120,100%,50%)'
        this.grapher.ctx.beginPath();
        for(var i=ceil(4*this.n/8);i<floor(5*this.n/8);i++){
            this.grapher.ctx.lineTo(
                    this.grapher.scale * (this.x[i]+this.grapher.center.x),
                    this.grapher.scale * (this.y[i]+this.grapher.center.y)
                );
        }
        this.grapher.ctx.stroke();
        this.grapher.ctx.closePath();
        /** ---------------------------------------------------------------------------- */
        this.grapher.ctx.strokeStyle = 'hsl(150,100%,50%)'
        this.grapher.ctx.beginPath();
        for(var i=ceil(5*this.n/8);i<floor(6*this.n/8);i++){
            this.grapher.ctx.lineTo(
                    this.grapher.scale * (this.x[i]+this.grapher.center.x),
                    this.grapher.scale * (this.y[i]+this.grapher.center.y)
                );
        }
        this.grapher.ctx.stroke();
        this.grapher.ctx.closePath();
        /** ---------------------------------------------------------------------------- */
        this.grapher.ctx.strokeStyle = 'hsl(180,100%,50%)'
        this.grapher.ctx.beginPath();
        for(var i=ceil(6*this.n/8);i<floor(7*this.n/8);i++){
            this.grapher.ctx.lineTo(
                    this.grapher.scale * (this.x[i]+this.grapher.center.x),
                    this.grapher.scale * (this.y[i]+this.grapher.center.y)
                );
        }
        this.grapher.ctx.stroke();
        this.grapher.ctx.closePath();
        /** ---------------------------------------------------------------------------- */
        this.grapher.ctx.strokeStyle = 'hsl(210,100%,50%)'
        this.grapher.ctx.beginPath();
        for(var i=ceil(7*this.n/8);i<this.n;i++){
            this.grapher.ctx.lineTo(
                    this.grapher.scale * (this.x[i]+this.grapher.center.x),
                    this.grapher.scale * (this.y[i]+this.grapher.center.y)
                );
        }
        this.grapher.ctx.stroke();
        this.grapher.ctx.closePath();
        
    }
    showR(){
        for(var i=0;i<this.n;i++){
            console.log(this.r[i]);
        }
    }
    updatePos1(y0){
        this.y0 = y0;
        this.b = this.y0 * pixel2meter;
        this.U0 = [0, 1/abs(this.b)];
        this.U = this.U0;
        var utemp = 0;
        /** Solving the ODE by the Classical Runge Kutta method*/
        for(var i=0;i<this.n;i++){
            this.U = rk4(this.F, this.phi[i], this.U, this.dphi);
            if(isNaN(this.U[0])){this.U[0] = utemp;}
            this.r[i] = 1/this.U[0];
            utemp = this.U[0];
        }
        /** Transfer from Polar coordinate to Cartesian coordinate*/
        var changePhase = false;
        if(this.y0>0){
            for(var i=0;i<this.n;i++){
                if(changePhase){this.r[i]=1e10;}
                this.x[i] = this.r[i] * meter2pixel * cos(this.phi[i]);
                this.y[i] = -this.r[i] * meter2pixel * sin(this.phi[i]);
                if(this.r[i]*this.r[i+1]<0){changePhase = true;}
            }
        }else{
            for(var i=0;i<this.n;i++){
                if(changePhase){this.r[i]=1e10;}
                this.x[i] = this.r[i] * meter2pixel * cos(this.phi[i]);
                this.y[i] = this.r[i] * meter2pixel * sin(this.phi[i]);
                if(this.r[i]*this.r[i+1]<0){changePhase = true;}
            }
        }
    }
    updatePos2(y0){
        this.y0 = y0;
        this.b = this.y0 * pixel2meter;
        this.U0 = [0, 1/abs(this.b)];
        this.U = this.U0;
        /** Solving the ODE by the Classical Runge Kutta method*/
        for(var i=0;i<this.n;i++){
            this.U = rk4(this.F, this.phi[i], this.U, this.dphi);
            this.r[i] = 1/this.U[0];
            if(isNaN(this.r[i])){this.r[i]=1}
        }
        /** Transfer from Polar coordinate to Cartesian coordinate*/
        var changePhase = false;
        for(var i=0;i<this.n;i++){
            if(changePhase){this.r[i]=1e10;}
            this.x[i] = this.r[i] * meter2pixel * cos(this.phi[i]);
            this.y[i] = -this.r[i] * meter2pixel * sin(this.phi[i]);
            if(this.r[i]*this.r[i+1]<0){changePhase = true;}
        }
    }
    draw(){
        this.drawSeg1();
    }
    update(){
        this.updatePos1(-(mouse.y - this.grapher.center.y));
    }
}
class photons {
    constructor(grapher, blackhole, n, r, phi_end=2*pi, strokeStyle='#f6be00'){
        this.grapher = grapher;
        this.phi_end = phi_end;
        this.strokeStyle = strokeStyle;
        if(r){
            this.n = n;
            if(r.length>n){
                this.n = r.length;
            }
            this.photon = [];
            for(var i=0;i<this.n;i++){
                this.photon[i] = new photon(grapher, blackhole, 0, r[i], phi_end, this.strokeStyle);
            }
        }else{
            this.n = n;
            this.photon = [];
            for(var i=0;i<this.n;i++){
                var y0 = this.grapher.height/2 * (i/this.n);
                this.photon[i] = new photon(grapher, blackhole, 0, y0, phi_end, this.strokeStyle);
            }
        }
    }
    draw(){
        for(var i=0;i<this.n;i++){
            this.photon[i].draw();
        }
    }
}


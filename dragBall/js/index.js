var i;
/** ---------------------------------------------------------------------------- */
// math function setting
const cos = Math.cos;
const sin = Math.sin;
const floor = Math.floor;
const sqrt = Math.sqrt;
const round = Math.round;
const ceil = Math.ceil;
const pi = Math.PI;
const random = Math.random;
const abs = Math.abs;
const max = Math.max;
const atan2 = Math.atan2;
/** ---------------------------------------------------------------------------- */
// canvas setting
const canvas = document.getElementById('app');
const ctx = canvas.getContext("2d");
const scale = 2;
const size = {width: window.innerWidth,height: window.innerHeight};
[canvas.style.width, canvas.style.height] = [`${size.width}px`, `${size.height}px`];
[canvas.width, canvas.height] = [parseInt(canvas.style.width) * scale, parseInt(canvas.style.height) * scale];
const center = {
	x: canvas.width/2, 
	y: canvas.height/2,
	max: max(canvas.width/2,canvas.height/2)
};
window.addEventListener("resize",()=>{
	size.width = window.innerWidth;
	size.height = window.innerHeight;
	[canvas.style.width, canvas.style.height] = [`${size.width}px`, `${size.height}px`];
	[canvas.width, canvas.height] = [parseInt(canvas.style.width) * scale, parseInt(canvas.style.height) * scale];
	center.x = canvas.width/2;
	center.y_ = canvas.height/2;
	center.max = max(canvas.width/2,canvas.height/2);
})
/** ---------------------------------------------------------------------------- */

var dt = 0.1;

const mouse = {
	x: 100,
	y: 100,
	down: false,
}
canvas.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    var cssScaleX = canvas.width / canvas.offsetWidth;
    var cssScaleY = canvas.height / canvas.offsetHeight;
    mouse.x = (e.clientX - rect.x) * cssScaleX;
    mouse.y = (e.clientY - rect.y) * cssScaleY;
});
canvas.addEventListener('mousedown', function(e) {
	mouse.down = true;
})
canvas.addEventListener('mouseup', function(e) {
	mouse.down = false;
})

/** ---------------------------------------------------------------------------- */
function drawArrow(fromx, fromy, tox, toy, arrowWidth){
    //variables to be used when creating the arrow
    var headlen = 10*scale;
    var angle = atan2(toy-fromy,tox-fromx);
 
    //starting path of the arrow from the start square to the end square
    //and drawing the stroke
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.stroke();
 
    //starting a new path from the head of the arrow to one of the sides of
    //the point
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox-headlen*cos(angle-pi/7),
               toy-headlen*sin(angle-pi/7));
 
    //path from the side point of the arrow, to the other side point
    ctx.lineTo(tox-headlen*cos(angle+pi/7),
               toy-headlen*sin(angle+pi/7));
 
    //path from the side point back to the tip of the arrow, and then
    //again to the opposite side point
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox-headlen*cos(angle-pi/7),
               toy-headlen*sin(angle-pi/7));
 
    //draws the paths created above
    ctx.stroke();
    ctx.restore();
    ctx.fill();
}

class ball{
	constructor(x,y){
		this.x0 = 0;
		this.y0 = 0;
		this.x = center.x + (0.5-random())*canvas.width/2;
		this.y = center.y + (0.5-random())*canvas.height/2;
		if(x){
			this.x = x;
		}
		if(y){
			this.y = y;
		}
		this.vx = 0;
		this.vy = 0;
		this.ax = 0;
		this.ay = 0;
		this.b = 0.1;

		this.color = '#ccc'
		this.selectedColor = 'blue';
		this.radius = 20;
		this.lineWidth = 1;
		this.strokeStyle = "#000";
		this.fillStyle = "#333";

		this.dragLineColor = 'red';
		this.dragLineWidth = 2;


		this.isHover = false;
		this.isSelected = false;
		this.isRecorded = false;
	}
	draw(){
		ctx.lineWidth = this.lineWidth*scale;
		ctx.strokeStyle = this.strokeStyle;
		ctx.fillStyle = this.fillStyle;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius*scale, 0, 2*pi);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
	}
	changeDirection(){
		if(this.x < this.radius || this.x > canvas.width - this.radius){
			this.vx = - this.vx; 
		}
		if(this.y < this.radius || this.y > canvas.height - this.radius){
			this.vy = - this.vy;
		}
	}
	checkHover(){
		var distance = round(sqrt((this.x-mouse.x)**2+(this.y-mouse.y)**2))/scale;
		if(distance>this.radius){
			this.isHover = false;
		}else{
			this.isHover = true;
		}
	}
	checkSelect(){
		if(this.isHover&mouse.down){
			this.isSelected = true;
		}
		if(!mouse.down){
			this.isSelected = false;
		}
	}
	update(){
		this.changeDirection();
		this.checkHover();
		this.checkSelect();
		/* -------------------------------- */
		if(this.isSelected){
			this.fillStyle = this.selectedColor;
			if(!this.isRecorded){
				this.x0 = this.x;
				this.y0 = this.y;
				this.isRecorded != this.isRecorded;
			}
			this.x = mouse.x;
			this.y = mouse.y;
			this.vx = (this.x0 - this.x);
			this.vy = (this.y0 - this.y);

			ctx.strokeStyle = this.dragLineColor;
			ctx.fillStyle = this.dragLineColor;
			ctx.lineWidth = this.dragLineWidth*scale;
			drawArrow(this.x, this.y, this.x0, this.y0);
			this.isRecorded = true;


		}else if(!this.isSelected){
			this.isRecorded = false;
			this.ax = - this.b * this.vx;
			this.ay = - this.b * this.vy;
			this.vx = this.vx + dt * this.ax;
			this.vy = this.vy + dt * this.ay;
			this.x = this.x + dt * this.vx;
			this.y = this.y + dt * this.vy;
			this.fillStyle = this.color;
		}
	}
}

class balls{
	constructor(n){
		this.ball = [];
		this.n = n;
		for(i = 0;i < this.n;i++){
			this.ball.push(new ball());
		}
		window.addEventListener('keydown',(e)=>{
			if(e.key=='ArrowLeft'){
				if(this.n>0){
					this.del();
				}
			}
			if(e.key=='ArrowRight'){
				this.add();
			}
		})
	}
	draw(){
		for(i=0;i<this.n;i++){
			this.ball[i].draw();
		}
	}
	del(){
		this.n = this.n - 1;
		this.ball.length = this.n;
	}
	add(){
		this.n = this.n + 1;
		this.ball.push(new ball());
	}
	update(){
		for(i=0;i<this.n;i++){
			this.ball[i].update();
		}
	}
}


/** ---------------------------------------------------------------------------- */
// initializer

const Balls = new balls(20);


/** ---------------------------------------------------------------------------- */
// main
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear all
    Balls.draw();
}

function update() {
	Balls.update();
}

function loop() {
    draw();
    update();
    requestAnimationFrame(loop);
}
loop()

const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.body.appendChild(canvas);

const img_paper = new Image();
img_paper.src = img_paper_src;

const img_scissors = new Image();
img_scissors.src = img_scissors_src;

const img_stone = new Image();
img_stone.src = img_stone_src;

const ctx = canvas.getContext('2d');

function rotateVelocity(velocityX, velocityY, angle) {
    const rotatedX = velocityX * Math.cos(angle) - velocityY * Math.sin(angle);
    const rotatedY = velocityX * Math.sin(angle) + velocityY * Math.cos(angle);
    return { x: rotatedX, y: rotatedY };
}

class Particle {
    constructor(x, y, radius) {
        const styles = ["paper","scissors","stone"];
        this.x = x;
        this.y = y;
        this.m = 2.0;
        this.radius = radius;
        this.v = 1.0;
        this.dx = this.v * (Math.random() - 1);
        this.dy = this.v * (Math.random() - 1);
        this.scale = 0.5;
        this.style = styles[Math.floor(Math.random()*3)];
    }

    draw() {

        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.clip();
        if(this.style=="paper"){
            ctx.drawImage(img_paper
                , this.x - this.radius
                , this.y - this.radius
                , 2*this.radius
                , 2*this.radius);
        }
        if(this.style=="scissors"){
            ctx.drawImage(img_scissors
                 , this.x - this.radius
                , this.y - this.radius
                , 2*this.radius
                , 2*this.radius);
        }
        if(this.style=="stone"){
            ctx.drawImage(img_stone
                , this.x - this.radius
                , this.y - this.radius
                , 2*this.radius
                , 2*this.radius);
        }
        ctx.restore();
    }
    update(particles) {
        this.x += this.dx;
        this.y += this.dy;

        for (let i = 0; i < particles.length; i++) {
            const other = particles[i];
            if (other === this) { continue; } 

            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.radius + other.radius) {
                if(this.style == "paper"){
                    if(other.style=="scissors"){
                        this.style = "scissors";
                    }else if(other.style=="stone"){
                        other.style = "paper"
                    }
                }else if(this.style == "scissors"){
                    if(other.style=="stone"){
                        this.style = "stone";
                    }else if(other.style=="paper"){
                        other.style = "scissors"
                    }
                }else if(this.style == "stone"){
                    if(other.style=="paper"){
                        this.style = "paper";
                    }else if(other.style=="scissors"){
                        other.style = "stone"
                    }
                }
                
                const collisionAngle = Math.atan2(dy, dx);
                const combinedRadius = this.radius + other.radius;

                const collisionX = this.x + (dx / distance) * this.radius;
                const collisionY = this.y + (dy / distance) * this.radius;

                const overlap = combinedRadius - distance;
                const adjustX = (overlap * dx) / distance;
                const adjustY = (overlap * dy) / distance;

                this.x -= adjustX;
                this.y -= adjustY;
                other.x += adjustX;
                other.y += adjustY;

                const relativeVelocityX = this.dx - other.dx;
                const relativeVelocityY = this.dy - other.dy;
                const velocityAngle = Math.atan2(relativeVelocityY, relativeVelocityX);
                const newVelocity1 = rotateVelocity(this.dx, this.dy, velocityAngle - collisionAngle);
                const newVelocity2 = rotateVelocity(other.dx, other.dy, velocityAngle - collisionAngle);

                this.dx = newVelocity1.x;
                this.dy = newVelocity1.y;
                other.dx = newVelocity2.x;
                other.dy = newVelocity2.y;
            }
        }

        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx *= -1;
        }

        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.dy *= -1;
        }

        this.draw();
    }

}
function checkOverlap(x, y, radius) {
    for (let i = 0; i < particles.length; i++) {
        const other = particles[i];
        const dx = other.x - x;
        const dy = other.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < radius + other.radius) {
            return true;
        }
    }
    return false;
}

const particles = [];
const colors = ['red','green','blue'];
for (let i = 0; i < 20; i++) {
    let radius, x, y;
    let isOverlapping;
    do {
        radius = 40;
        x = Math.random() * (canvas.width - radius * 2) + radius;
        y = Math.random() * (canvas.height - radius * 2) + radius;
        isOverlapping = checkOverlap(x, y, radius);
    } while (isOverlapping);

    const color = colors[Math.floor(Math.random()*3)];
    particles.push(new Particle(x, y, radius));
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update(particles);
    }

    requestAnimationFrame(animate);
}

animate();
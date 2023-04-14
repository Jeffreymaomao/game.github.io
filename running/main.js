//============================================================
// 遊戲常用設定
//============================================================
// 創建大小為 640x360 的繪圖區域在 container 中，名為 win
var win = Sketch.create({
    fullscreen: false,
    width: 640,//window.innerWidth
    height: 360,
    container: document.getElementById('draw')
});
//============================================================
// 函數：在 min ~ max 之間產生隨機的數字
function random(min, max) {
    /*This function is to produce a random number.*/
    return Math.round(min + (Math.random() * (max - min)));
}
// 函數：在 array 當中，取出隨機的物件
function randomChoice(array) {
    /*This function is to choose a random object in array.*/
    return array[Math.round(random(0, array.length - 1))];
}
// 函數：輸掉時顯示一個 div
function lose(){
    var div = document.createElement("div");
    div.textContent = "LOSE";
    div.setAttribute("class","lose");
    //alert(1);
    div.addEventListener("click",(e)=>{
        
    })

}
// 函數：暫停幾秒
function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}
//============================================================
// 定義一個向量模板，設定新向量時用
// var v = new vector(0,0,1,1)
function vector(x,y,width,height){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.preX = 0;
    this.preY = 0;
}
// 方法：設定位置 x 
vector.prototype.setX = function (x) {
    this.preX = this.x;
    this.x = x;
};
// 方法：設定位置 y 
vector.prototype.setY = function (y) {
    this.preY = this.y;
    this.y = y;
};
// 方法：設定位置 x 和 y
vector.prototype.setPosition = function (x, y) {
    this.previousX = this.x;
    this.previousY = this.y;
    this.x = x;
    this.y = y;
};
// 方法：回傳是否有碰到 object
vector.prototype.insersects = function (obj) {
    if (obj.x < this.x + this.width && obj.y < this.y + this.height &&
        obj.x + obj.width > this.x && obj.y + obj.height > this.y) {
        return true;
    }
    return false;
};
// 方法：回傳是否有碰到 object 左邊
vector.prototype.insersectsLeft = function (obj) {
    if (obj.x < this.x + this.width && obj.y < this.y + this.height) {
        return true;
    }
    return false;
};

//============================================================
// 定義一個玩家模板
function player(options) {
    this.setPosition(options.x, options.y);
    this.width = options.width;
    this.height = options.height;
    this.velocityX = 0;
    this.velocityY = 0;
    this.jumpSize = -13;
    this.color = '#fff';
}
// 設定玩家原型
player.prototype = new vector;
// 方法：更新玩家
player.prototype.update = function () {
    // 速度+1，往下掉
    this.velocityY += 1;
    // 設定位置
    this.setPosition(this.x + this.velocityX, this.y + this.velocityY);
    // 當失敗時全部重設
    if (this.y > win.height || this.x + this.width < 0) {
        this.x = 150;
        this.y = 50;
        this.velocityX = 0;
        this.velocityY = 0;
        win.jumpCount = 0;
        win.aceleration = 0;
        win.acelerationTweening = 0;
        win.platformManager.maxDistanceBetween = 350;
        win.platformManager.updateWhenLose();
    }

    if ((win.keys.UP || win.keys.SPACE || win.keys.W || win.dragging) && this.velocityY < -8) {
        this.velocityY += -0.75;
    }

};
// 方法：繪製於 win 中
player.prototype.draw = function () {
    win.fillStyle = this.color;
    win.fillRect(this.x, this.y, this.width, this.height);
    win.beginPath();
    win.rect(this.x, this.y, this.width, this.height);
    win.stroke();
};
//============================================================
// 定義一個平台模板
function platform(options) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.preX = 0;
    this.preY = 0;
    this.color = options.color;
}
// 設定平台原型
platform.prototype = new vector;
// 方法：繪製於 win 中
platform.prototype.draw = function () {
    win.fillStyle = this.color;
    win.fillRect(this.x, this.y, this.width, this.height);
};
//============================================================
// 定義一個設定平台類型的模板
function platformManager() {
    this.maxDistanceBetween = 300;
    this.colors = ["#dde8b9","#e8d2ae","#d7b29d","#cb8589","#796465"];
    // 第一種平台
    this.first = new platform({
        x: 100,
        y: win.width / 2,
        width: 400,
        height: 70
    })
    // 第二種平台
    this.second = new platform({
        x: (this.first.x + this.first.width) + random(this.maxDistanceBetween - 150, this.maxDistanceBetween),
        y: random(this.first.y - 128, win.height - 80),
        width: 400,
        height: 70
    })
    // 第三種平台
    this.third = new platform({
        x: (this.second.x + this.second.width) + random(this.maxDistanceBetween - 150, this.maxDistanceBetween),
        y: random(this.second.y - 128, win.height - 80),
        width: 400,
        height: 70
    })

    this.first.height = this.first.y + win.height;
    this.second.height = this.second.y + win.height;
    this.third.height = this.third.y + win.height;
    this.first.color = randomChoice(this.colors);
    this.second.color = randomChoice(this.colors);
    this.third.color = randomChoice(this.colors);

    this.colliding = false;
    this.platforms = [this.first, this.second, this.third];
}
// 方法：更新平台
platformManager.prototype.update = function () {
    this.first.x -= 3 + win.aceleration;
    if (this.first.x + this.first.width < 0) {
        this.first.width = random(450, win.width + 200);
        this.first.x = (this.third.x + this.third.width) + random(this.maxDistanceBetween - 150, this.maxDistanceBetween);
        this.first.y = random(this.third.y - 32, win.height - 80);
        this.first.height = this.first.y + win.height + 10;
        this.first.color = randomChoice(this.colors);
    }

    this.second.x -= 3 + win.aceleration;
    if (this.second.x + this.second.width < 0) {
        this.second.width = random(450, win.width + 200);
        this.second.x = (this.first.x + this.first.width) + random(this.maxDistanceBetween - 150, this.maxDistanceBetween);
        this.second.y = random(this.first.y - 32, win.height - 80);
        this.second.height = this.second.y + win.height + 10;
        this.second.color = randomChoice(this.colors);
    }

    this.third.x -= 3 + win.aceleration;
    if (this.third.x + this.third.width < 0) {
        this.third.width = random(450, win.width + 200);
        this.third.x = (this.second.x + this.second.width) + random(this.maxDistanceBetween - 150, this.maxDistanceBetween);
        this.third.y = random(this.second.y - 32, win.height - 80);
        this.third.height = this.third.y + win.height + 10;
        this.third.color = randomChoice(this.colors);
    }
};
// 方法：失敗時全部重設
platformManager.prototype.updateWhenLose = function () {
    this.first.x = 300;
    this.first.color = randomChoice(this.colors);
    this.first.y = win.width / random(2, 3);
    this.second.x = (this.first.x + this.first.width) + random(this.maxDistanceBetween - 150, this.maxDistanceBetween);
    this.third.x = (this.second.x + this.second.width) + random(this.maxDistanceBetween - 150, this.maxDistanceBetween);
    lose();
};
//============================================================
// 定義跑動時的粒子效果
function particle(options) {
    this.x = options.x;
    this.y = options.y;
    this.size = 10;
    this.scatterX = 10;
    this.scatterY = 10;
    this.velocityX = options.velocityX || random(-(win.aceleration * 3) - this.scatterX, -(win.aceleration * 3));
    this.velocityY = options.velocityY || random(-(win.aceleration * 3) - this.scatterY, -(win.aceleration * 3));
    this.color = options.color;
}

particle.prototype.update = function () {
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.size *= 0.8;
};

particle.prototype.draw = function () {
    win.fillStyle = this.color;
    win.fillRect(this.x, this.y, this.size, this.size);
};
//============================================================
// 遊戲主程式
//============================================================
var i = 0; // 設定跑 for 迴圈時的變數 
//------------------------------------------------------------
// 繪圖區設置
win.setup = function () {

    this.jumpCount = 0;
    this.aceleration = 0;
    this.acelerationTweening = 0;

    this.player = new player({
        x: 150,
        y: 30,
        width: 32,
        height: 32
    });

    this.platformManager = new platformManager();

    this.particles = [];
    this.particlesIndex = 0;
    this.particlesMax = 20;
    this.collidedPlatform = null;
    this.jumpCountRecord = 0;

};
//------------------------------------------------------------
// 遊戲更新
win.update = function () {

    this.player.update();

    this.aceleration += (this.acelerationTweening - this.aceleration) * 0.01;
    // 跑過所有的平台（有三個）
    for (i = 0; i < this.platformManager.platforms.length; i++) {
        // 如果玩家跟平台相交
        if (this.player.insersects(this.platformManager.platforms[i])) {
            this.collidedPlatform = this.platformManager.platforms[i];
            // 如果玩家掉到平台之下，相當於撞到平台的前面
            if (this.player.y < this.platformManager.platforms[i].y) {
                this.player.y = this.platformManager.platforms[i].y;
                // 玩家不會往下掉
                this.player.velocityY = 0;
            }
            // 更新每一次玩家的位置
            this.player.x = this.player.previousX;
            this.player.y = this.player.previousY;
            // 產生粒子，玩家在跑的時候跟在後面的隨機分佈粒子
            this.particles[(this.particlesIndex++) % this.particlesMax] = new particle({
                x: this.player.x,
                y: this.player.y + this.player.height,
                color: this.collidedPlatform.color
            });
            // 檢查：如果玩家撞到平台的左邊
            if (this.player.insersectsLeft(this.platformManager.platforms[i])) {
                this.player.x = this.collidedPlatform.x - 64;
                for (i = 0; i < 10; i++) {
                    // 粒子換方向
                    this.particles[(this.particlesIndex++) % this.particlesMax] = new particle({
                        x: this.player.x + this.player.width,
                        y: random(this.player.y, this.player.y + this.player.height),
                        velocityY: random(-30, 30),
                        color: randomChoice(['#181818', '#181818', this.collidedPlatform.color])
                    });
                };
                // 玩家向左飛
                this.player.velocityY = -10 + -(this.aceleration * 4);
                this.player.velocityX = -20 + -(this.aceleration * 4);
            // 檢查：玩家沒有撞到平台的左邊 
            } else {
                // 每點點一下、空白鍵、上、W按鍵
                if (this.dragging || this.keys.SPACE || this.keys.UP || this.keys.W) {
                    // 就往上跳
                    this.player.velocityY = this.player.jumpSize;
                    this.jumpCount++;
                    if (this.jumpCount > this.jumpCountRecord) {
                        this.jumpCountRecord = this.jumpCount;
                    }
                }

            }

        }
    };

    for (i = 0; i < this.platformManager.platforms.length; i++) {
        this.platformManager.update();
    };

    for (i = 0; i < this.particles.length; i++) {
        this.particles[i].update();
    };

};

win.draw = function () {
    this.player.draw();

    for (i = 0; i < this.platformManager.platforms.length; i++) {
        this.platformManager.platforms[i].draw();
    };

    for (i = 0; i < this.particles.length; i++) {
        this.particles[i].draw();
    };
    record.textContent = this.jumpCountRecord;
    score.textContent = this.jumpCount;

};

win.resize = function () {

};
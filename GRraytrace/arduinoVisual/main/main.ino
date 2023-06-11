#include "./LCD12864.h"             // LCD12864 面板的標頭檔
#include "./lib/Vec.h"              // c++ 中向量的標頭檔 (struct)
#include "./lib/AccretionDisk.h"    // c++ 中吸積盤的標頭檔 (struct)
#include "./lib/Photon.h"           // c++ 中光子的標頭檔案 (struct)
#include "./lib/image.h"            // c++ 預先載入圖片的檔案

extern unsigned char img[1024];     // 由於是使用預先載入圖片的檔案，需要使用 extern 定義照片
bool press = 0;                     // 定義 press ，用於處存是否按下按鈕
const int btn = 8;                  // 按鈕的偵測接角
const double Rs = 4.0;              // 史瓦希半徑大小，用於數值計算
void drawAll(bool value){
    /*
        此函數是把 img 變數中所有元素輸入 0 或 1 。
        計算方法過於繁雜不多贅述，
        主要就是每8個像素為一個數列元素，
        因此用 2^n 做計算，並使用到了 c++ 的位移算符。
    */
    for (int i = 0; i < 1024; i++) {
        img[i] = 0x00;
        for (int j = 0; j < 8; j++) {
            img[i] += value * (1 << 7 - j);
        }
    }
    LCDA.drawFullScreen(img); // 寫入照片、顯示
}
void drawBlackHole(double psi){
    const int Width = 128;          // 螢幕寬度
    const int Height = 64;          // 螢幕高度
    double theta = M_PI / 2 - psi;  // 三維空間中，相機與 z 軸夾角
    double phi = 0.0;               // 三維空間中，相機與 x 軸夾腳 
    double camDist = 500;           // 三維空間中，相機距離黑洞距離
    double imgDist = 50;            // 三維空間中，投影面距離黑洞距離
    /* 利用球座標，計算相機與投影平面之笛卡爾座標(x,y,z) */
    const Vec3 camera(camDist * sin(theta) * cos(phi), camDist * sin(theta) * sin(phi), camDist * cos(theta));
    const Vec3 image0(imgDist * sin(theta) * cos(phi), imgDist * sin(theta) * sin(phi), imgDist * cos(theta));
    const Vec3 cam2img = image0 - camera;                           // 計算相機到投影平面中心之向量
    const Vec3 right = cam2img.cross(Vec3(0, 0, 1)).normalize();    // 計算相機向右向量
    const Vec3 up = cam2img.cross(right).normalize();               // 計算相機向上向量
    const AccretionDisk accretiondisk(5 * Rs, 15 * Rs);             // 創建一個黑洞的吸積盤

    bool value; // 暫存數據，用於處存該像素之亮與暗
    for (int i = 0; i < 1024; i++) {
        img[i] = 0x00;  // LCD數列中元素全改為 0 
        for (int j = 0; j < 8; j++) {
            double x = (i % 16) * 8 + j;    // 計算 LCD 數列中對應到的像素 x 座標
            double y = floor(i / 16);       // 計算 LCD 數列中對應到的像素 u 座標

            double u = x - Width / 2;       // 將像素座標平移到正中間  
            double v = y - Height / 2;      // 將像素座標平移到正中間  
            /* ---------------------------------------------------------------------- */
            value = false;  // 先將該像素改成暗 
            const Vec3 imagePoint = image0 + up * v + right * u;  // 創建一個在投平面中心到該像素點的向量

            Photon photon(camera, imagePoint, right, up);  // 創建一個光子，從相機到投影平面發射
            if (photon.isCross(accretiondisk)) { value = true; }    // 當光子穿過吸積盤，該像素就變為亮

            /* ---------------------------------------------------------------------- */
            img[i] += value * (1 << 7 - j);  // img[i] = img[i] + value * 2^(7-j)
        }
        if (i % 16 == 15) {
            Serial.println(i);          // 計算完每一列，回傳當下的數列座標
            LCDA.drawFullScreen(img);   // 計算完每一列，更新LCD 螢幕
        }
    }
}

int main() {
    init();                    // Arduino 初始化
    pinMode(btn, INPUT);       // 按鈕改為輸入
    Serial.begin(9600);        // Serial Port 初始化
    LCDA.initialise();         // LCD螢幕初始化
    LCDA.drawFullScreen(img);  // 先畫一次螢幕
    delay(1000);               // 經過 1 秒之後 
    LCDA.drawFullScreen(img);  // 再畫一次螢幕

    while (true) {
        press =  digitalRead(btn);  // 每一個迴圈都讀取按鈕的數值
        LCDA.drawFullScreen(img);   // 繪製螢幕（閃一下）
        if(press){ drawBlackHole(0.2);} // 當按下按鈕，計算仰角為0.2的黑洞樣貌
        delay(1000);                // 暫停 1 秒
    }
    return 0;
}
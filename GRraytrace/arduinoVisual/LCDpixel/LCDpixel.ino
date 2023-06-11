#include "LCD12864.h"
unsigned char img_lcd[1024];
/**
 * ________________________________________________
 * img_lcd size ( 1024 ):
 *    height : 64
 *    width  : 16
 * ________________________________________________
 * img_pxl size ( 8192 ): 
 *    height : 64
 *    width  : 16 * 8
 * ________________________________________________
 * 
*/
float radius(float x, float y){
  return sqrt(x*x+y*y);
}

void setup(){
  LCDA.initialise();
  delay(100);
}

boolean f(float x, float y){
  if (x*x+y*y<640){
    return true;
  }else{
    return false;
  }
}

void loop(){
  int x,y;
  float r = 1.0;
  boolean value = true;
  for(int i=0;i<1024;i++){
      img_lcd[i] = 0x00;
      for(int j=0;j<8;j++){
          x = (i%16)*8 + j;
          y = i/16;
          value = f(x-64,y-32);
          img_lcd[i] += value * (1<<7-j); 
      }
  }
  LCDA.drawFullScreen(img_lcd);
  delay(1000);
}

/*
LCD pins          Arduino pins
RS(CS) latchpin    10 
RW(SID)datapin     11 
EN(CLK) clockpin   13

*/

#include "LCD12864RSPI.h"
#include "Acoptex_bmp.h"
#include "Acoptex_char.h"

#define AR_SIZE( a ) sizeof( a ) / sizeof( a[0] )

unsigned char wangzhi[]=" acoptex.com ";//

unsigned char en_char1[]="LCD 12864";// 

unsigned char en_char2[]="Test sketch ";// 

unsigned char en_char3[]="Acoptex";// 

void setup()
{
  LCDA.initialise(); // INIT SCREEN
  delay(100);
  LCDA.drawFullScreen(logo);//LOGO
  delay(5000);
  Serial.begin(9600);
  Serial.println(sizeof(logo)/sizeof(logo[0]));
}

void loop()
{
LCDA.clear();//
delay(100);
LCDA.displayString(0,0,en_char1,16);//
delay(10);
LCDA.displayString(1,0,en_char2,16);//
delay(10);
LCDA.displayString(2,0,en_char3,16);//
delay(10);
LCDA.displayString(3,0,wangzhi,16);//
delay(5000);
LCDA.clear();//
delay(100);
LCDA.displayString(0,0,show1,16);//
delay(10);
LCDA.displayString(1,0,show2,16);//
delay(10);
LCDA.displayString(2,0,show3,16);//
delay(10);
LCDA.displayString(3,0,wangzhi,16);//LOGO
delay(5000);
}

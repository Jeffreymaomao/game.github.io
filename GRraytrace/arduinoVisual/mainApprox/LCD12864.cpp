#include "arduino.h"
#include "LCD12864.h"

extern "C" {
	#include <inttypes.h>
	#include <avr/pgmspace.h>
}


LCD12864RSPI::LCD12864RSPI() 
{
	this->DEFAULTTIME = 80; // 80 ms default time
	this->delayTime = DEFAULTTIME;
} 

/* Delay dalayTime amount of microseconds. */
void LCD12864RSPI::delayns(void){ 
	delayMicroseconds(delayTime);
}

/* Write byte data. */
void LCD12864RSPI::writeByte(int data){
	digitalWrite(latchPin, HIGH);
	delayns();
	shiftOut(dataPin, clockPin, MSBFIRST, data);
	digitalWrite(latchPin, LOW);
}

/* Write command cmd into the screen. */
void LCD12864RSPI::writeCommand(int cmd){
	int H_data,L_data;
	H_data = cmd;
	H_data &= 0xf0;           //Mask lower 4 bit data
	L_data = cmd;             //Format: xxxx0000
	L_data &= 0x0f;           //Mask higher 4 bit data
	L_data <<= 4;             //Format: xxxx0000
	writeByte(0xf8);          //RS=0, an instruction is to be written.
	writeByte(H_data);
	writeByte(L_data);
}

/* Write data data into the screen. */
void LCD12864RSPI::writeData(int data)
{
	int H_data,L_data;
	H_data = data;
	H_data &= 0xf0;           //Mask lower 4 bit data
	L_data = data;            //Format: xxxx0000
	L_data &= 0x0f;           //Mask higher 4 bit data
	L_data <<= 4;             //Format: xxxx0000
	writeByte(0xfa);          //RS=1, data is to be written.
	writeByte(H_data);
	writeByte(L_data);
}

/* Initialize the screen. */
void LCD12864RSPI::initialise(){

    pinMode(latchPin, OUTPUT);     
    pinMode(clockPin, OUTPUT);    
    pinMode(dataPin, OUTPUT);
    digitalWrite(latchPin, LOW);
    delayns();

    writeCommand(0x30);        //Function related command. ¹¦ÄÜÉè¶¨¿ØÖÆ×Ö
    writeCommand(0x0c);        //Display related command. ÏÔÊ¾¿ª¹Ø¿ØÖÆ×Ö
    writeCommand(0x01);        //Clear related command. Çå³ýÆÁÄ»¿ØÖÆ×Ö
    writeCommand(0x06);        //Preset point instruction command. ½øÈëÉè¶¨µã¿ØÖÆ×Ö
}

/* Clear the screen. */
void LCD12864RSPI::clear(void){  
    writeCommand(0x30);
    writeCommand(0x01); // Clear screen command.
}

/* Display the full screen using data from p. */
void LCD12864RSPI::drawFullScreen(uchar *p){
	int ygroup,x,y,i;
	int temp;
	int tmp;
             
	for(ygroup=0;ygroup<64;ygroup++){         
		if(ygroup<32){
			x=0x80;
			y=ygroup+0x80;
		}else{
			x=0x88;
			y=ygroup-32+0x80;    
		}         
		writeCommand(0x34);
		writeCommand(y);   
		writeCommand(x);
		writeCommand(0x30);  
		tmp=ygroup*16;
		for(i=0;i<16;i++){
			temp=p[tmp++];
			writeData(temp);
		}
	}
	writeCommand(0x34);
	writeCommand(0x36);
}

LCD12864RSPI LCDA = LCD12864RSPI();

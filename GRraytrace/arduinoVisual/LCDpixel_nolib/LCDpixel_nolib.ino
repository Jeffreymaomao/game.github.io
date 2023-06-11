const int latchPin = 10; 
const int clockPin = 13;  
const int dataPin  = 11; 
void initialise(){

    pinMode(latchPin, OUTPUT);     
    pinMode(clockPin, OUTPUT);    
    pinMode(dataPin, OUTPUT);
    digitalWrite(latchPin, LOW);
    delayMicroseconds(80);

    writeCommand(0x30);        //Function related command. ¹¦ÄÜÉè¶¨¿ØÖÆ×Ö
    writeCommand(0x0c);        //Display related command. ÏÔÊ¾¿ª¹Ø¿ØÖÆ×Ö
    writeCommand(0x01);        //Clear related command. Çå³ýÆÁÄ»¿ØÖÆ×Ö
    writeCommand(0x06);        //Preset point instruction command. ½øÈëÉè¶¨µã¿ØÖÆ×Ö
}

void writeByte(int data){
  digitalWrite(latchPin, HIGH);
  delayMicroseconds(80);
  shiftOut(dataPin, clockPin, MSBFIRST, data);
  digitalWrite(latchPin, LOW);
}

void writeCommand(int cmd){
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

void writeData(int data){
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

void drawFullScreen(unsigned char *p){
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

unsigned char img_lcd[1024];
void setup(){
    initialise();
    Serial.begin(9600);
    delay(100);
}

void loop(){
    boolean const img8list[8] = {1,1,1,1,1,1,1,1};
    unsigned char value;
    
    for(int i=0;i<1024;i++){
        value = 0x00;
        for(int j=0;j<8;j++){
            value += img8list[j] * (1<<7-j); 
        }
        img_lcd[i] = value;
    }




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
        temp=img_lcd[tmp++];
        writeData(temp);
      }
    }
    writeCommand(0x34);
    writeCommand(0x36);
    delay(1000);
}

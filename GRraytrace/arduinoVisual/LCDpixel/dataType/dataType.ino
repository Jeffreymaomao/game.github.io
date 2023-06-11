void drawAll(unsigned char img[1024], unsigned char value){
    for(int i=0;i<1024;i++){
        img[i] = value;
    }
}

void setup(){ 
    Serial.begin(9600);
    delay(100);
    Serial.println("_________________________|");

    
}

void loop(){
    unsigned char img_lcd[1024];
    boolean img8list[8] = {false,false,false,false,false,false,false,false};
    
    
    Serial.println("_________________________|");
    Serial.println(img_pxl[0]);
    Serial.println(img_lcd[0]);

    Serial.println(img_pxl[8191]);
    Serial.println(img_lcd[1023]);

    delay(1000);
  
}

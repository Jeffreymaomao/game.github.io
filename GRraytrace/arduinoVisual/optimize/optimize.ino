#include "./LCD12864.h"
#include "./lib/Vec.h"
#include "./lib/AccretionDisk.h"
#include "./lib/Photon.h"

#include "./lib/image.h" 
extern unsigned char img[1024];
// unsigned char img[1024];

const double Rs = 4.0;


int main(){
	/** =================================================================
	 * Initializer
	 * =================================================================*/
	init();						// Arduino initialize
	Serial.begin(9600);			// Serial Port intialize
    LCDA.initialise();			// LCD screen initialize
    LCDA.drawFullScreen(img);	// Draw a intial image first
	/** =================================================================
	 * Algorithm
	 * =================================================================*/
    const int Width = 128;
	const int Height = 64;

	const double theta = M_PI/2 - 0.1;
	const double phi = 0.0;
	const double camDist = 50;
	const double imgDist = 20;
	const Vec3 camera = polarToCartesian(camDist,theta,phi);
	const Vec3 image0 = polarToCartesian(imgDist,theta,phi);
	const Vec3 cam2img = image0-camera;
	const Vec3 axisY = cam2img.cross(Vec3(0,0.5,1)).normalize();
	const Vec3 axisZ = cam2img.cross(axisY).normalize();
	const AccretionDisk accretiondisk(4*Rs, 10*Rs);

    Serial.println("start time");
    unsigned long StartTime = millis();

	bool value;
	for(int i=0;i<1024;i++){
		img[i] = 0x00; // pixels in LCD image
        double x,y;
		for(int j=0;j<8;j++){
			x = (i%16) * 8 + j;	// index in LCD image to pixel image
			y = floor(i/16);		// index in LCD image to pixel image

            double u = x-Width/2;
			double v = y-Height/2;
			Vec3 imagePoint	= image0 + axisZ * v + axisY * u;  // create a image point vector 
			Photon photon(camera, imagePoint);			// create a photon start from camera point at image point
			value = false;
			// if(photon.isCross(accretiondisk)){value = true;}
			if(photon.isCrossAdaptive(accretiondisk)){value = true;}
			img[i] += value * (1<<7-j); // img[i] = img[i] + value * 2^(7-j)
            // Serial.print(x);
            // Serial.print(",");
            // Serial.println(y);
		}
		if(i%16==15){
			LCDA.drawFullScreen(img);	// every time calculating one row, redraw the image to LCD
		}
        
	}

    unsigned long CurrentTime = millis();
    Serial.println("end time");
    Serial.print("Calculate time:\t");
    Serial.print((CurrentTime - StartTime)*0.001/60);// 425124
    Serial.println("\t(min)");

	LCDA.drawFullScreen(img);

	while(true){
		// do noting
	}
	return 0;
}
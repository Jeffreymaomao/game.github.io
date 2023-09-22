#include <iostream>		// namespace: cout,endl,clock
#include <fstream> 		// namespace: 
#include <cmath>		// namespace: sqrt
#include <time.h>		// namespace: CLOCKS_PER_SEC
#include <sys/stat.h>		


#include "./lib/Vec.h"
#include "./lib/AccretionDisk.h"
#include "./lib/Photon.h"
const int scale = 3;
const double Rs = 3.0 * scale; // Schwarzschild Radius = Rs pixels

void clamp255(double& col) {
	col = (col > 255) ? 255 : (col < 0) ? 0 : col;
}

/* Black Hole at (0,0,0) */

int main(){

	const int Width = 128 * scale;
	const int Height = 64 * scale;

	double theta = M_PI/2 - 0.1;
	double phi = 0.0;
	double camDist = 500;
	double imgDist = 50;
	double level = 0;
	const Vec3 black(0,0,0);
	const Vec3 white(255,255,255);
	const Vec3 red(255,0,0);
	const Vec3 green(0,255,0);
	const Vec3 blue(0,0,255);

	const Vec3 camera(camDist*sin(theta)*cos(phi),camDist*sin(theta)*sin(phi),camDist*cos(theta));
	const Vec3 image0(imgDist*sin(theta)*cos(phi),imgDist*sin(theta)*sin(phi),imgDist*cos(theta));
	const Vec3 cam2img = image0-camera;
	const Vec3 right = cam2img.cross(Vec3(0,0,1)).normalize();
	const Vec3 up = cam2img.cross(right).normalize();
	const AccretionDisk accretiondisk(5*Rs, 15*Rs);

	std::ofstream image("blackhole.ppm");

	image << "P3\n" << Width << ' ' << Height << ' ' << 255 << '\n';
	for(int h=0;h<Height;h++){
		for(int w=0;w<Width;w++){
			double u = w-Width/2;
			double v = h-Height/2;
			double radius=0.0;
			Vec3 imagePoint	= image0 + up*v + right*u;

			Photon photon(camera, imagePoint);
			if(photon.isCross(accretiondisk, radius)){
				level = (radius/accretiondisk.max);
				image << (white*level).color() << '\n';
			}
			else{
				image << black.color() << '\n';
			}
		}
	}
	system("open blackhole.ppm");
	return 0;
}
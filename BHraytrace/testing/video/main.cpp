#include <iostream>		// namespace: cout,endl,clock
#include <fstream> 		// namespace: 
#include <string> 		// namespace: 
#include <cmath>		// namespace: sqrt
#include <time.h>		// namespace: CLOCKS_PER_SEC
#include <sys/stat.h>		// namespace: CLOCKS_PER_SEC

#include "./lib/Vec.h"
#include "./lib/AccretionDisk.h"
#include "./lib/Photon.h"
const int scale = 	1;
const double Rs = 3.0 * scale; // Schwarzschild Radius = Rs pixels

int main(){

	const int Width = 128 * scale;
	const int Height = 64 * scale;
	const AccretionDisk accretiondisk(5*Rs, 15*Rs);

	system("rm ./images/blackhole*");
	int N = 50;
	for(int i=0;i<N;i++){
		std::string name_ppm = "./images/blackhole" + std::to_string(i) + ".ppm";
		std::ofstream image(name_ppm);
		image << "P1\n" << Width << ' ' << Height << ' ' << "\n";

		double theta = M_PI/2 - M_PI/2*(i/(double)N);
		double phi = 0.0;
		double camDist = 500;
		double imgDist = 50;
		const Vec3 camera(camDist*sin(theta)*cos(phi),camDist*sin(theta)*sin(phi),camDist*cos(theta));
		const Vec3 image0(imgDist*sin(theta)*cos(phi),imgDist*sin(theta)*sin(phi),imgDist*cos(theta));

		const Vec3 cam2img = image0-camera;
		const Vec3 right = cam2img.cross(Vec3(0,0,1)).normalize();
		const Vec3 up = cam2img.cross(right).normalize();

		AccretionDisk accretiondisk(4*Rs, 15*Rs);
		for(int h=0;h<Height;h++){
			for(int w=0;w<Width;w++){
				double u = w-Width/2;
				double v = h-Height/2;
				Vec3 imagePoint	= image0 + up*v + right*u;

				Photon photon(camera, imagePoint);
				if(photon.isCross(accretiondisk)){image << 0 << '\n';}
				else{image << 1 << '\n';}
			}
		}
		image.close();
	}
	system("rm output.mp4");
	system("ffmpeg -framerate 10 -i ./images/blackhole%d.ppm -c:v libx264 -crf 25 -vf \"scale=1280:640,format=yuv420p\" -movflags +faststart output.mp4");
	system("open output.mp4");
	return 0;
}
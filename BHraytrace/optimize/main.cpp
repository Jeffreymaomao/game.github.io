#include <iostream>		// namespace: cout,endl,clock
#include <fstream> 		// namespace: 
#include <cmath>		// namespace: sqrt
#include <time.h>		// namespace: CLOCKS_PER_SEC
#include <sys/stat.h>		


#include "./lib/Vec.h"
#include "./lib/AccretionDisk.h"
#include "./lib/Photon.h"
const int scale = 5;
const double Rs = 4.0 * scale; // Schwarzschild Radius = Rs pixels


/* Black Hole at (0,0,0) */

int main(){
	const int Width = 128 * scale;
	const int Height = 64 * scale;
	
	double delta = 0.0;
	std::cout << "Altutide angle : ";
	std::cin >> delta;


	const double theta = M_PI/2 - delta;
	const double phi = 0.0;
	const double camDist = 50 * scale;
	const double imgDist = 20 * scale;
	const Vec3 camera = polarToCartesian(camDist,theta,phi);
	const Vec3 image0 = polarToCartesian(imgDist,theta,phi);
	const Vec3 cam2img = image0-camera;
	const Vec3 axisY = cam2img.cross(Vec3(0,0.5,1)).normalize();
	const Vec3 axisZ = cam2img.cross(axisY).normalize();
	const AccretionDisk accretiondisk(4*Rs, 10*Rs);

	std::ofstream image("blackhole.ppm");
	image << "P1\n" << Width << ' ' << Height << ' ' << "\n";
	clock_t Ti,Tf;
	Ti = clock();
	for(int h=0;h<Height;h++){
		for(int w=0;w<Width;w++){
			// std::cout << h << "," << w << std::endl;
			double u = w-Width/2;
			double v = h-Height/2;
			const Vec3 imagePoint = image0 + axisZ*v + axisY*u;
			Photon photon(camera, imagePoint);
			// if(photon.isCross(accretiondisk)){image << 0 << '\n';}
			if(photon.isCrossAdaptive(accretiondisk)){image << 0 << '\n';}
			// if(photon.isCrossApprox(accretiondisk)){image << 0 << '\n';}
			else{image << 1 << '\n';}
		}
	}
	Tf = clock();
	std::cout << "Calculation Time : "<< (double)(Tf-Ti)/CLOCKS_PER_SEC << std::endl;
	system("open blackhole.ppm");
	return 0;
}
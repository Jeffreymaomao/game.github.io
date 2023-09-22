#include <iostream>		// namespace: cout,endl,clock
#include <fstream> 		// namespace: 
#include <cmath>		// namespace: sqrt
#include <sys/stat.h>	// namespace: system


#include "./lib/Vec.h"
#include "./lib/AccretionDisk.h"
#include "./lib/Photon.h"
const int scale = 10;
const double Rs = 4.0 * scale; // Schwarzschild Radius = Rs pixels

/* Black Hole at (0,0,0) */

int main(){
	const int Width = 128 * scale;
	const int Height = 64 * scale;
	std::cout << "image shape : (" << Width << "," << Height << ")" << std::endl;
	
	double delta = 0.0;
	std::cout << "psi0 : ";
	std::cin >> delta;


	const double theta = M_PI/2 - delta;
	const double phi = 0;
	const double camDist = 500 * scale;
	const double imgDist = 200 * scale;
	const Vec3 camera = polarToCartesian(camDist,theta,phi);
	const Vec3 image0 = polarToCartesian(imgDist,theta,phi);
	const Vec3 cam2img = image0-camera;
	const Vec3 right = cam2img.cross(Vec3(0.0, 0.0, 1.0)).normalize();
	const Vec3 up = right.cross(cam2img).normalize();

	const AccretionDisk accretiondisk(5*Rs, 15*Rs);

	std::cout << "camera : " << camera <<std::endl;
	std::cout << "image0 : " << image0 <<std::endl;

	std::ofstream image("blackhole.ppm");
	image << "P1\n" << Width << ' ' << Height << ' ' << "\n";
	clock_t Ti,Tf;
	Ti = clock();
	for(int h=0;h<Height;h++){
		for(int w=0;w<Width;w++){
			double u = w-Width/2;
			double v = h-Height/2;
			int check = 1;
			const Vec3 imagePoint = image0 + up*v + right*u;
			Photon photon(camera, imagePoint,right,up);
			if(photon.isCross(accretiondisk)){check = 0;}
			image << check << '\n';
		}
	}
	Tf = clock();
	std::cout << "Calculation Time : "<< (double)(Tf-Ti)/CLOCKS_PER_SEC << "s" << std::endl;
	system("open blackhole.ppm");
	return 0;
}
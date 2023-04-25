#include <iostream>		// namespace: cout,endl,clock
#include <fstream> 		// namespace: 
#include <cmath>		// namespace: sqrt
#include <time.h>		// namespace: CLOCKS_PER_SEC

#include "./lib/Vec.h"
const int scale = 2;
const double Rs = 3.0 * scale; // Schwarzschild Radius = Rs pixels

/* Black Hole at (0,0,0) */

struct AccretionDisk{
	double min, max, angle;
	AccretionDisk(const double minR, const double maxR, const double phi){
		min = minR;
		max = maxR;
		angle = phi;
	}
};

struct Photon{
	double dphi, phi, phi0, phi_end, theta, b, r, imgR, z;
	Vec2 U;
	Vec3 origin, end, direction;
	Photon(const Vec3& origin, const Vec3& end):
		origin(origin),
		end(end),
		direction((end - origin).normalize()),
		U()
		{
			r 		= origin.x;				// original r 		(S1)
			theta   = atan2(end.z, end.y);	// original theta	(S1)
			phi     = 0.00;					// original phi 	(S1)

			imgR 	= sqrt(end.y*end.y + end.z*end.z);	// original r on image
			phi0    = atan2(imgR, origin.x-end.x);		// original phi
			b 		= origin.x * sin(phi0);				// original b (B.C.)

			dphi    = 0.001;	// step size of phi
			phi_end = 3*M_PI;	// end of phi

			U.x = 0;			// u (0) = 0
			U.y = 1/(b/Rs);		// u'(0) = Rs/b
			z = r * sin(phi-phi0) * sin(theta);
		}
	
	Vec2 F(double phi, Vec2 U){
        double F0 = U.y;
        double F1 = 1.5 * U.x*U.x - U.x; // non-GR:  F1 = - U.x
        return {F0,F1};
    }

    Vec2 RK4(double phi, Vec2 U, double h) {

	    Vec2 k1, k2, k3, k4;
	    k1 = F(phi, U);
	    k2 = F(phi + h/2.0, {U.x + h/2.0 * k1.x, U.y + h/2.0 * k1.y});
	    k3 = F(phi + h/2.0, {U.x + h/2.0 * k2.x, U.y + h/2.0 * k2.y});
	    k4 = F(phi + h, {U.x + h * k3.x, U.y + h * k3.y});

	    double U0 = U.x + h/6.0 * (k1.x + 2.0*k2.x + 2.0*k3.x + k4.x);
	    double U1 = U.y + h/6.0 * (k1.y + 2.0*k2.y + 2.0*k3.y + k4.y);

	    return {U0, U1};
	}

	bool isCross(AccretionDisk accretiondisk){
		while(phi<phi_end){

			U = RK4(phi,U,dphi);
			phi = phi + dphi;
			r = Rs/U.x;
			z = r * sin(phi-phi0) * sin(theta);

			if(accretiondisk.min<r && r < accretiondisk.max){
				double angle = acos(z/r);
				double delta = abs(angle - accretiondisk.angle);
				if(delta<dphi){return true;}
			}


		}
		return false;
	}
};

int main(){

	const int Width = 128 * scale;
	const int Height = 64 * scale;

	double x_image  = 500 * scale;
	double x_camera = 5000 * scale;

	const Vec3 camera 		(x_camera,  0, 0);
	const AccretionDisk accretiondisk(4*Rs, 15*Rs, M_PI/2+0.1);

	std::ofstream image("blackhole.ppm");
	image << "P1\n" << Width << ' ' << Height << ' ' << "\n";
	for(int h=0;h<Height;h++){
		for(int w=0;w<Width;w++){

			Vec3 imagePoint	(x_image, w - Width/2, h-Height/2);
			Photon photon(camera, imagePoint);

			if(photon.isCross(accretiondisk)){ image << 0 << '\n';}
			else{image << 1 << '\n';}

		}
	}
	return 0;
}
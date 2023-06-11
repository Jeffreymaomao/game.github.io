extern const double Rs;
struct Photon{
	double dphi, phi, phi0, phi_end, theta, b, r, imgR, z;
	Vec2 U;
	Vec3 origin, end;
	Photon(const Vec3& origin, const Vec3& end):
		origin(origin),
		end(end),
		U()
		{
			r 		  = origin.x;             // original r 		(S1)
			theta   = atan2(end.z, end.y);  // original theta	(S1)
			phi     = 0.00;                 // original phi 	(S1)

			imgR 	= sqrt(end.y*end.y + end.z*end.z); // original r on image
			phi0    = atan2(imgR, r-end.x);  // original phi
			b 		= r * sin(phi0);           // original b (B.C.)

			dphi    = 0.02;	// step size of phi
			phi_end = 2*M_PI;	// end of phi
			U.x = 0;			// u (0) = 0
			U.y = Rs/b;		// u'(0) = Rs/b
			z = r * sin(phi-phi0) * sin(theta);
		}
	
	Vec2 ODE(double phi, Vec2 U){
    double F0 = U.y;
    double F1 = 1.5 * U.x*U.x - U.x; // non-GR:  F1 = - U.x
    return {F0,F1};
  }

  Vec2 RK4(double phi, Vec2 U, double h) {
    Vec2 k1, k2, k3, k4;
    k1 = ODE(phi, U);
    k2 = ODE(phi + h/2.0, U + k1 * h/2.0);
    k3 = ODE(phi + h/2.0, U + k2 * h/2.0);
    k4 = ODE(phi + h,     U + k3 * h);
    return U + (k1 + k2*2.0 + k3*2.0 + k4)*h/6.0;
  }

	Vec2 RK1(double phi, Vec2 U, double h) {
    return U+ODE(phi, U)*h;
	}

	bool isCross(AccretionDisk accretiondisk){
		while(phi<phi_end){

			U = RK1(phi,U,dphi);
			phi = phi + dphi;
			r = Rs/U.x;
			z = r * sin(phi-phi0) * sin(theta);

			if(accretiondisk.min<r && r < accretiondisk.max){
				double angle = acos(z/r);
				double delta = abs(angle - accretiondisk.angle);
				if(delta<dphi){return true;}
			}
			if(r<1.5*Rs){return false;}
		}
		return false;
	}
};

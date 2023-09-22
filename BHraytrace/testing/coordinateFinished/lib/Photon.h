extern const double Rs;
struct Photon{
	double dphi, phi, phi0, phi_end, b, r, theta,psi0,x_phi_,y_phi_,x_phi,y_phi;
	Vec2 U;
	Vec3 origin, end, direction,right, up;
	Photon(const Vec3& origin, const Vec3& end, const Vec3& right, const Vec3& up):
		origin(origin),end(end),right(right),up(up)
		{
			direction = end - origin;
			
			r 		= origin.length();		// original r 		(S1)
			phi     = 0.00;					// original phi 	(S1)

			phi0 	= acos(-direction.normalize().dot(origin.normalize()));
			b 		= r * sin(phi0);

			psi0   = asin(origin.z/origin.length());
			theta   = atan2(direction.dot(up), direction.dot(right));
			dphi    = 0.01;		// step size of phi
			phi_end = 3*M_PI;	// end of phi

			U.x = 0;	// u (0) = 0
			U.y = Rs/b;	// u'(0) = Rs/b

			x_phi_ = r * cos(phi);
			y_phi_ = r * sin(phi) * sin(theta);
			x_phi = x_phi_ * cos(psi0) + y_phi_ * sin(psi0);
			y_phi = x_phi_ * sin(psi0) - y_phi_ * cos(psi0);
		}
	Vec2 ODE(double phi, Vec2 U){
        double F0 = U.y;
        double F1 = 1.5 * U.x*U.x - U.x; // non-GR:  F1 = - U.x
        return {F0,F1};
    }
	Vec2 RK1(double phi, Vec2 U, double h) {
		return U + ODE(phi, U)*h;
	}
	Vec2 RK2(double phi, Vec2 U, double h) {
		Vec2 k1, k2;
		k1 = ODE(phi, U);
		k2 = ODE(phi+h, U+k1*h);
		return U + (k1+k2)*dphi/2;
	}
	Vec2 RK4(double phi, Vec2 U, double h) {
		Vec2 k1, k2, k3, k4;
		k1 = ODE(phi, U);
		k2 = ODE(phi + h/2.0, U + k1 * h/2.0);
		k3 = ODE(phi + h/2.0, U + k2 * h/2.0);
		k4 = ODE(phi + h,     U + k3 * h);
		return U + (k1 + k2*2.0 + k3*2.0 + k4)*h/6.0;
	}
	double u(double phi){
		double b2,b3,b4,u0,u1,u2;
		b2 = b*b;
	    b3 = b2*b;
	    b4 = b3*b;
	    u0 = sin(phi)/b;
	    u1 = (3-4*cos(phi)+cos(2*phi))/(b2*4);
	    u2 = ((-21*phi)/(16*b4) + 5/(64*b3))*sin(phi) + ((-15*phi)/(16*b3) - 399/(320*b4))*cos(phi) + sin(2*phi)/(2*b3) - 3*sin(3*phi)/(64*b3) - pow((1-cos(2*phi)),2)/(160*b4) - 9*cos(2*phi)/(20*b4) + 3*cos(3*phi)/(64*b4) + 33/(20*b4);
		return (u0+u1+u2);
	}
	bool isCrossExact(AccretionDisk accretiondisk){
		while(phi<phi_end){
			double r_ = r;
			double y_ = y_phi;
			U = RK2(phi,U,dphi);

			phi = phi + dphi;
			r = Rs/U.x;

			x_phi_ = r * cos(phi);
			y_phi_ = r * sin(phi) * sin(-theta);
			x_phi = x_phi_ * cos(psi0) - y_phi_ * sin(psi0);
			y_phi = x_phi_ * sin(psi0) + y_phi_ * cos(psi0);

			if(accretiondisk.min < abs(r) && abs(r) < accretiondisk.max && phi>phi0){
				if(y_phi*y_<=0){
					return true;
				}
			}
			if(r*r_<0){
				return false;
			}
		}
		return false;
	}
	bool isCrossArrox(AccretionDisk accretiondisk){
		phi = psi0 + 1 - sin(theta);
		r = 1/u(phi);
		if(accretiondisk.min < abs(r) && abs(r) < accretiondisk.max){return true;}
		return false;
	}
	bool isCross(AccretionDisk accretiondisk){
		return isCrossExact(accretiondisk);
	}
};

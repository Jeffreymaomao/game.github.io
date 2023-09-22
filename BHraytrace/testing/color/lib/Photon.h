extern const double Rs;
struct Photon{
	double dphi, phi, phi0, phi_end, b, r, imgR, x, y, z;
	Vec2 U;
	Vec3 origin, end, direction, position,axisX,axisY,axisZ;
	Photon(const Vec3& origin, const Vec3& end):
		origin(origin),
		end(end),
		direction((end - origin).normalize()),
		U(),
		position(origin),
		axisX(origin.normalize()),
		axisY(direction.cross(origin).normalize()),
		axisZ(origin.cross(axisY).normalize())
		{

			Vec3 imgCenter(origin.normalize()*end.length());
			Vec3 imgVector(end - imgCenter);

			r 		= origin.length();		// original r 		(S1)
			phi     = 0.00;					// original phi 	(S1)

			phi0 	= M_PI - acos(direction.dot(origin)/(direction.length()*origin.length()));
			b 		= r * sin(phi0);		// original b (B.C.)

			dphi    = 0.001;	// step size of phi
			phi_end = 3*M_PI;	// end of phi

			U.x = 0;			// u (0) = 0
			U.y = 1/(b/Rs);		// u'(0) = Rs/b
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
		return U + ODE(phi, U)*h;
	}

	double u(double phi){
		return sin(phi)/b + (3-4*cos(phi)+cos(2*phi))/b/b;
	}
	bool isCross(AccretionDisk accretiondisk, double& radius_now){
		while(phi<phi_end){
			double z_ = position.z;
			U = RK1(phi,U,dphi);
			phi = phi + dphi;
			r = Rs/U.x;
			position = axisX * r * cos(phi) + axisZ * r * sin(phi);
			if(accretiondisk.min<r && r < accretiondisk.max){
				if(position.z*z_<=0){radius_now = r;return true;}
			}
		}
		return false;
	}
	bool isCrossApprox(AccretionDisk accretiondisk){
		while(phi<phi_end){
			double z_ = z;
			phi = phi + dphi;
			r = Rs/u(phi);
			position = axisX * r * cos(phi) + axisZ * r * sin(phi);
			if(abs(r-1.5*Rs)<=dphi){return true;}
			if(accretiondisk.min<r && r < accretiondisk.max){
				if(position.z*z_<=0){return true;}
			}
		}
		return false;
	}
};

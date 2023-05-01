extern const double Rs;
struct Photon{
	double dphi, phi, phi0, phi_end, b, r, imgR, x, y, z, theta;
	Vec2 U;
	Vec3 origin, end, direction, position,axisX,axisY,axisZ;
	Photon(const Vec3& origin, const Vec3& end):
		origin(origin),
		end(end),
		direction(),
		position(origin),
		U(),axisX(),axisY(),axisZ()
		{
			direction = (end - origin).normalize();
			axisX = origin.normalize();
			axisY = direction.cross(origin).normalize();
			axisZ = origin.cross(axisY).normalize();

			Vec3 imgCenter(origin.normalize()*end.length());
			Vec3 imgVector(end - imgCenter);

			r 		= origin.length();		// original r 		(S1)
			phi     = 0.00;					// original phi 	(S1)
			theta   = axisZ.dot(Vec3(0,0,1));

			phi0 	= M_PI - acos(direction.dot(origin)/(direction.length()*origin.length()));
			b 		= r * sin(phi0);		// original b (B.C.)

			dphi    = 0.01;		// step size of phi
			phi_end = 3*M_PI;	// end of phi

			U.x = 0;			// u (0) = 0
			U.y = 1/(b/Rs);		// u'(0) = Rs/b
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
	double u0(double phi){
		return sin(phi)/b;
	}
	double u1(double phi){
		return 0.25*(3-4*cos(phi)+cos(2*phi))/b/b;
	}
	double u2(double phi){
	    double b2 = b*b;
	    double b3 = b2*b;
	    double b4 = b3*b;
	    return ((-21*phi)/(16*b4) + 5/(64*b3))*sin(phi) + ((-15*phi)/(16*b3) - 399/(320*b4))*cos(phi) + sin(2*phi)/(2*b3) - 3*sin(3*phi)/(64*b3) - pow((1-cos(2*phi)),2)/(160*b4) - 9*cos(2*phi)/(20*b4) + 3*cos(3*phi)/(64*b4) + 33/(20*b4);
	}
	double u(double phi){
		double b2 = b*b;
	    double b3 = b2*b;
	    double b4 = b3*b;
	    double u0 = sin(phi)/b;
	    double u1 = (3-4*cos(phi)+cos(2*phi))/(b2*4);
	    double u2 = ((-21*phi)/(16*b4) + 5/(64*b3))*sin(phi) + ((-15*phi)/(16*b3) - 399/(320*b4))*cos(phi) + sin(2*phi)/(2*b3) - 3*sin(3*phi)/(64*b3) - pow((1-cos(2*phi)),2)/(160*b4) - 9*cos(2*phi)/(20*b4) + 3*cos(3*phi)/(64*b4) + 33/(20*b4);
		return (u0+u1+u2);
	}
	bool isCross(AccretionDisk accretiondisk){
		while(phi<phi_end){
			double z_ = position.z;
			U = RK1(phi,U,dphi);

			phi = phi + dphi;
			r = Rs/U.x;

			position = axisX * r * cos(phi) + axisZ * r * sin(phi);
			if(accretiondisk.min<r && r < accretiondisk.max){
				if(position.z*z_<=0){return true;}
			}
		}
		return false;
	}
	bool isCrossAdaptive(AccretionDisk accretiondisk){
		while(phi<phi_end){
			double z_ = position.z;
			double zd = abs(z_);

			if(zd>1e-2){
				dphi = 2e-2;
				U = RK2(phi,U,dphi);
			}else{
				dphi = fmax(1e-2,zd/10);
				U = RK1(phi,U,dphi);
			}

			phi = phi + dphi;
			r = Rs/U.x;

			position = axisX * r * cos(phi) + axisZ * r * sin(phi);
			if(accretiondisk.min<r && r < accretiondisk.max){
				if(position.z*z_<=0){return true;}
			}
		}
		return false;
	}
	bool isCrossApprox(AccretionDisk accretiondisk){
		dphi = 0.01;
		while(phi<phi_end){
			double z_ = position.z;

			double zd = abs(z_);
			if(zd<0.001){
				dphi=0.0001;
			}else if(zd<0.01){
				dphi=0.001;
			}else{
				dphi=0.01;
			}

			// if(zd<0.01){
			// 	dphi = zd/10;
			// }else{
			// 	dphi = 0.01;
			// }

			U = RK1(phi,U,dphi);

			phi = phi + dphi;
			r = 1/u(phi);

			position = axisX * r * cos(phi) + axisZ * r * sin(phi);

			if(accretiondisk.min<r && r < accretiondisk.max){
				if(position.z*z_<=0){return true;}
			}
		}
		return false;
	}
};

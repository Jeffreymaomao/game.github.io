struct Vec2 {
	double x,y;
	// constructor
	Vec2(double x, double y): 
		x(x),y(y){}
	Vec2(std::initializer_list<double> list) {
	    if (list.size() == 2) {
	        x = *(list.begin());
	        y = *(list.begin() + 1);
	    } else {
	        throw std::out_of_range("Initializer list must contain two elements!");
	    }
	}
	Vec2():x(),y(){
	}
	Vec2 operator + (const Vec2& v) const {return Vec2(x+v.x, y+v.y);}
	Vec2 operator - (const Vec2& v) const {return Vec2(x-v.x, y-v.y);}
	Vec2 operator * (double n) const {return Vec2(x*n, y*n);}
	Vec2 operator / (double n) const {return Vec2(x/n, y/n);}
	Vec2 operator << (double n) const {return Vec2(x/n, y/n);}

	Vec2& operator=(const Vec2& v) {
        x = v.x;
        y = v.y;
        return *this;
    }

	// vector normalization
	Vec2 normalize() const {double mg = sqrt(x*x + y*y);return Vec2(x/mg,y/mg);}
	// dot product of vector
	double dot(const Vec2& v) const { return (x * v.x + y * v.y); }
	// length of vector
	double length() const { return sqrt(x*x+y*y); }
	friend std::ostream& operator<<(std::ostream& os, const Vec2& v) {
    	os << "(" << v.x << ", " << v.y << ")";
    	return os;
    }
};

struct Vec3 {
	double x,y,z;
	// constructor
	Vec3(double x, double y, double z): 
		x(x),y(y),z(z){}
	Vec3 operator + (const Vec3& v) const {return Vec3(x+v.x, y+v.y, z+v.z);}
	Vec3 operator - (const Vec3& v) const {return Vec3(x-v.x, y-v.y, z-v.z);}
	Vec3 operator * (double n) const {return Vec3(x*n, y*n, z*n);}
	Vec3 operator / (double n) const {return Vec3(x/n, y/n, z/n);}
	Vec3 operator << (double n) const {return Vec3(x/n, y/n, z/n);}

	Vec3& operator=(const Vec3& v) {
        x = v.x;
        y = v.y;
        z = v.z;
        return *this;
    }
	// vector normalization
	Vec3 normalize() const {double mg = sqrt(x*x + y*y + z*z);return Vec3(x/mg,y/mg,z/mg);}
	// dot product of vector
	double dot(const Vec3& v) const { return (x * v.x + y * v.y + z * v.z); }
	// length of vector
	double length() const { return sqrt(x*x+y*y+z*z); }
	friend std::ostream& operator<<(std::ostream& os, const Vec3& v) {
    	os << "(" << v.x << ", " << v.y << ", " << v.z << ")";
    	return os;
    }
};
struct Vec2 {
	double x,y;
	Vec2(double x, double y): x(x),y(y){}
	Vec2():x(),y(){}
	Vec2 operator + (const Vec2& v) const {return Vec2(x+v.x, y+v.y);}
	Vec2 operator - (const Vec2& v) const {return Vec2(x-v.x, y-v.y);}
	Vec2 operator * (double n) const {return Vec2(x*n, y*n);}
	Vec2 operator / (double n) const {return Vec2(x/n, y/n);}
	Vec2& operator=(const Vec2& v) {x = v.x;y = v.y;return *this;}
};

struct Vec3 {
	double x,y,z;
	Vec3(double x, double y, double z): x(x),y(y),z(z){}
	Vec3 operator + (const Vec3& v) const {return Vec3(x+v.x, y+v.y, z+v.z);}
	Vec3 operator - (const Vec3& v) const {return Vec3(x-v.x, y-v.y, z-v.z);}
	Vec3 operator * (double n) const {return Vec3(x*n, y*n, z*n);}
	Vec3 operator / (double n) const {return Vec3(x/n, y/n, z/n);}
	Vec3& operator=(const Vec3& v) {x = v.x;y = v.y;z = v.z;return *this;}
	Vec3 normalize() const {double mg = sqrt(x*x + y*y + z*z);return Vec3(x/mg,y/mg,z/mg);}
	Vec3 cross(const Vec3& v) const {
	    double x_ = y * v.z - z * v.y;
	    double y_ = z * v.x - x * v.z;
	    double z_ = x * v.y - y * v.x;
	    return Vec3(x_, y_, z_);
	}
	double dot(const Vec3& v) const { return (x * v.x + y * v.y + z * v.z); }
	double length() const { return sqrt(x*x+y*y+z*z); }
};
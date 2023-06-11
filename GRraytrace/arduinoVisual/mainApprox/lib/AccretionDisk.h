struct AccretionDisk{
	double min, max, angle;
	AccretionDisk(const double minR, const double maxR, const double phi){
		min = minR;
		max = maxR;
		angle = phi;
	}
};

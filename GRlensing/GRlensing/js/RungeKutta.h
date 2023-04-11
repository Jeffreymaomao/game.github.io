// #include <stdio.h>
// #include <math.h>
void rk1(void (*func)(double,double*,double*), double t, double* y, double h, int N) {
    double dydt[N];
    int i;
    func(t, y, dydt);
    for (i = 0; i < N; i++) {
        y[i] += h * dydt[i];
    }
}

void rk2(void (*func)(double,double*,double*), double t, double* y, double h, int N) {
    double k1[N], k2[N], dydt[N], ytemp[N];
    int i;
    func(t, y, dydt);
    for (i = 0; i < N; i++) {
        k1[i] = h * dydt[i];
        ytemp[i] = y[i] + 0.5 * k1[i];
    }
    func(t + 0.5 * h, ytemp, dydt);
    for (i = 0; i < N; i++) {
        k2[i] = h * dydt[i];
        y[i] += k2[i];
    }
}
void rk3(void (*func)(double,double*,double*), double t, double* y, double h, int N) {
    double k1[N], k2[N], k3[N], dydt[N], ytemp[N];
    int i;
    func(t, y, dydt);
    for (i = 0; i < N; i++) {
        k1[i] = h * dydt[i];
        ytemp[i] = y[i] + 0.5 * k1[i];
    }
    func(t + 0.5 * h, ytemp, dydt);
    for (i = 0; i < N; i++) {
        k2[i] = h * dydt[i];
        ytemp[i] = y[i] - k1[i] + 2.0 * k2[i];
    }
    func(t + h, ytemp, dydt);
    for (i = 0; i < N; i++) {
        k3[i] = h * dydt[i];
        y[i] += (k1[i] + 4.0 * k2[i] + k3[i]) / 6.0;
    }
}



void rk4(void (*func)(double,double*,double*), double t, double* y, double h, int N) {
    double k1[N], k2[N], k3[N], k4[N], dydt[N], ytemp[N];
    int i;
    func(t, y, dydt);
    for (i = 0; i < N; i++) {
        k1[i] = h * dydt[i];
        ytemp[i] = y[i] + 0.5 * k1[i];
    }
    func(t + 0.5 * h, ytemp, dydt);
    for (i = 0; i < N; i++) {
        k2[i] = h * dydt[i];
        ytemp[i] = y[i] + 0.5 * k2[i];
    }
    func(t + 0.5 * h, ytemp, dydt);
    for (i = 0; i < N; i++) {
        k3[i] = h * dydt[i];
        ytemp[i] = y[i] + k3[i];
    }
    func(t + h, ytemp, dydt);
    for (i = 0; i < N; i++) {
        k4[i] = h * dydt[i];
        y[i] += (k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i]) / 6.0;
    }
}

void rk6(void (*func)(double,double*,double*), double t, double* y, double h, int N) {
    double k1[N], k2[N], k3[N], k4[N], k5[N], k6[N], dydt[N], ytemp[N];
    int i;
    func(t, y, dydt);

    for (i = 0; i < N; i++) {
        k1[i] = h * dydt[i];
        ytemp[i] = y[i] + 0.5 * k1[i];
    }
    func(t + 0.5 * h, ytemp, dydt);

    for (i = 0; i < N; i++) {
        k2[i] = h * dydt[i];
        ytemp[i] = y[i] + 0.5 * k2[i];
    }
    func(t + 0.5 * h, ytemp, dydt);

    for (i = 0; i < N; i++) {
        k3[i] = h * dydt[i];
        ytemp[i] = y[i] + k3[i];
    }
    func(t + h, ytemp, dydt);

    for (i = 0; i < N; i++) {
        k4[i] = h * dydt[i];
        ytemp[i] = y[i] + (1.0/4.0)*k1[i] + (1.0/4.0)*k2[i] + (1.0/2.0)*k3[i];
    }
    func(t + (1.0/2.0)*h, ytemp, dydt);

    for (i = 0; i < N; i++) {
        k5[i] = h * dydt[i];
        ytemp[i] = y[i] + (7.0/27.0)*k1[i] + (10.0/27.0)*k2[i] - (8.0/27.0)*k3[i] + (8.0/27.0)*k4[i];
    }
    func(t + (2.0/3.0)*h, ytemp, dydt);

    for (i = 0; i < N; i++) {
        k6[i] = h * dydt[i];
        ytemp[i] = y[i] + (28.0/625.0)*k1[i] - (56.0/625.0)*k2[i] + (70.0/625.0)*k3[i] + (28.0/625.0)*k4[i] - (28.0/625.0)*k5[i];
    }
    func(t + (5.0/6.0)*h, ytemp, dydt);
    
    for (i = 0; i < N; i++) {
        y[i] = y[i] + (28.0/625.0)*k1[i] - (56.0/625.0)*k2[i] + (70.0/625.0)*k3[i] + (28.0/625.0)*k4[i] - (28.0/625.0)*k5[i] + (28.0/625.0)*k6[i];
    }
}



void rk8(void (*func)(double,double*,double*), double t, double* y, double h, int N) {
    double k1[N], k2[N], k3[N], k4[N], k5[N], k6[N], k7[N], k8[N], dydt[N], ytemp[N];
    int i;
    func(t, y, dydt);

    for (i = 0; i < N; i++) {
        k1[i] = h * dydt[i];
        ytemp[i] = y[i] + 0.5 * k1[i];
    }
    func(t + 0.5 * h, ytemp, dydt);

    for (i = 0; i < N; i++) {
        k2[i] = h * dydt[i];
        ytemp[i] = y[i] + 0.5 * k2[i];
    }
    func(t + 0.5 * h, ytemp, dydt);

    for (i = 0; i < N; i++) {
        k3[i] = h * dydt[i];
        ytemp[i] = y[i] + k3[i];
    }
    func(t + h, ytemp, dydt);

    for (i = 0; i < N; i++) {
        k4[i] = h * dydt[i];
        ytemp[i] = y[i] + (2.0/3.0)*k1[i] + (1.0/3.0)*k2[i] + (2.0/3.0)*k3[i];
    }
    func(t + (2.0/3.0)*h, ytemp, dydt);

    for (i = 0; i < N; i++) {
        k5[i] = h * dydt[i];
        ytemp[i] = y[i] + (1.0/3.0)*k1[i] + (2.0/3.0)*k2[i] + (1.0/3.0)*k3[i] + (1.0/6.0)*k4[i];
    }
    func(t + (1.0/3.0)*h, ytemp, dydt);

    for (i = 0; i < N; i++) {
        k6[i] = h * dydt[i];
        ytemp[i] = y[i] + (1.0/8.0)*k1[i] + (3.0/8.0)*k2[i] + (3.0/8.0)*k3[i] + (1.0/8.0)*k4[i] + (1.0/4.0)*k5[i];
    }
    func(t + (1.0/2.0)*h, ytemp, dydt);

    for (i = 0; i < N; i++) {
        k7[i] = h * dydt[i];
        ytemp[i] = y[i] - (1.0/5.0)*k1[i] + (5.0/12.0)*k2[i] + (3.0/4.0)*k3[i] + (8.0/15.0)*k4[i] + (1.0/3.0)*k5[i] - (0.5)*k6[i];
    }
    func(t + (3.0/4.0)*h, ytemp, dydt);
    for (i = 0; i < N; i++) {
    	k8[i] = h * dydt[i];
    	ytemp[i] = y[i] + (7.0/90.0)*k1[i] + (0.0)*k2[i] + (32.0/45.0)*k3[i] + (12.0/45.0)*k4[i] + (32.0/225.0)*k5[i] + (126.0/225.0)*k6[i] + (0.0)*k7[i] + (1.0/12.0)*k8[i];
	}
	func(t + h, ytemp, dydt);
	for (i = 0; i < N; i++) {
		y[i] = y[i] + (7.0/90.0)*k1[i] + (0.0)*k2[i] + (32.0/45.0)*k3[i] + (12.0/45.0)*k4[i] + (32.0/225.0)*k5[i] + (126.0/225.0)*k6[i] + (0.0)*k7[i] + (1.0/12.0)*k8[i];
	}
}

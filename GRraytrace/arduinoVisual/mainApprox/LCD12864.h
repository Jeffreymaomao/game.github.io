#ifndef LCD12864RSPI_h
#define LCD12864RSPI_h
#include <avr/pgmspace.h>
#include <inttypes.h>

class LCD12864RSPI {
	typedef unsigned char uchar;

public:
	LCD12864RSPI();
	
	void initialise(void);         /* Initialize the screen. */
	void delayns(void);            /* Delay dalayTime amount of microseconds. */
	void clear(void);                          /* Clear the screen. */
	void writeByte(int data);      /* Write byte data. */
	void writeCommand(int cmd);    /* Write command cmd into the screen. */
	void writeData(int data);      /* Write data data into the screen. */
	
	void drawFullScreen(uchar *p);  /* Display the full screen using data from p. */

	int delayTime;    /* Delay time in microseconds. */
	int DEFAULTTIME;  /* Default delay time. */

	static const int latchPin = 10; 
	static const int clockPin = 13;  
	static const int dataPin  = 11;  
};
extern LCD12864RSPI LCDA;    
#endif

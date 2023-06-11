#include <iostream> 
#include <fstream>
#define HEX( x ) std::setw(2) << std::setfill('0') << std::hex << (int)( x )

int main(){
    unsigned char img[1024];

    std::ifstream file("image.ppm");
    if(file.is_open()){
        std::string line;
        std::cout << "open" << std::endl;
        std::getline(file,line);
        std::cout << line << std::endl;
        std::getline(file,line);
        std::cout << line << std::endl;


        bool value=0;
        for(int i=0;i<1024;i++){
            img[i] = 0x00;
            for(int j=0;j<8;j++){
                std::getline(file,line);
                if(line=="0"){value = false;}
                if(line=="1"){value = true;}
                img[i] += value * (1<<(7-j)); 
            }
        }
    }
    file.close();

    std::ofstream image("image.txt");
    if(image.is_open()){
        for(int i=0;i<1024;i++){
            image << "0x" << HEX(255-img[i]) << ",";
            if(i%16==15){
                image << std::endl;
            }
        }
    }
    image.close();
    return 0;
}
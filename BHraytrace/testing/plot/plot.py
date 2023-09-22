import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

plt.rcParams.update({
    "font.family": "Times New Roman",
    "font.size": 13,
    "text.usetex": True,
    "text.latex.preamble": r"\usepackage{amsfonts}"
})


df = pd.read_csv('plot/data.csv', sep=' ')
head = df.columns
data = df.to_numpy()

print("start: Graph data")


for i in range(1,head.size):
    print("There are %d datas, in %d column."%(data[:,i].size,i))
    plt.plot(data[:,0],data[:,i],"-o",markersize=1, label=head[i],linewidth=1)
plt.xlabel(head[0])


blackhole  = np.array([  0,  0,  0]);
imageP     = np.array([ 50,  0, 10]);
camera     = np.array([100,  0,  0]);

plt.scatter(blackhole[0],blackhole[2],color='black')
plt.scatter(imageP[0],imageP[2],color='blue')
plt.scatter(camera[0],camera[2],color='blue')



xlim = [blackhole[0],camera[0]]
ylim = [blackhole[2],imageP[2]]

cx = np.mean(xlim)
cy = np.mean(ylim)
lx = abs(blackhole[0] - cx)
ly = abs(blackhole[2] - cy)

s = 2

plt.legend()

plt.axis("equal")
# plt.xlim(cx - s*lx, cx + s*lx)
plt.ylim([cy - s*ly, cy + s*ly])
plt.show()

print("end: Graph data")

import pandas as pd
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# 讀取CSV文件中的數據
data = pd.read_csv('data.csv',sep=',')

# 提取x、y、z坐標
x = data['x']
y = data['y']
z = data['z']

# 創建3D圖形
fig = plt.figure(figsize=(16,7.5))
ax = fig.add_subplot(111, projection='3d')
ax.grid(False) 
ax.xaxis.pane.fill = False
ax.yaxis.pane.fill = False
ax.zaxis.pane.fill = False

# 繪製數據點

ax.scatter3D(x, y, z, color='k', s=1000/len(x))

# 設置圖形標題和坐標軸標籤
ax.set_title('3D Scatter Plot')
ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')
ax.axis('equal')
ax.legend()

# 顯示圖形
plt.show()

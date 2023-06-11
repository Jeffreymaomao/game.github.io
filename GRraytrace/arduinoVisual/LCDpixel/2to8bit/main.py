

def list2hex(bytelist):
	n = 0x00
	for i in range(8):
		n += bytelist[i] * 2**(7-i)
	return hex(n)

def main():
	data = [1,1,1,1, 1,1,1,1]
	print(list2hex(data))
	return 0


if __name__ == "__main__":
	main()
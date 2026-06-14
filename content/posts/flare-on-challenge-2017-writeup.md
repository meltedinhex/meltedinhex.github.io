---
title: "Flare-On Challenge 2017 Writeup"
date: 2017-10-15T17:04:00+05:30
slug: "flare-on-challenge-2017-writeup"
draft: false
tags:
  - "CTF"
  - "Flare-On 2017"
  - "FlareOn4"
cover:
  image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjJuzTsZjGI2vAMKnHcwMwOBzBQY5I4vYN2RoFyc6AMzR1TAk_2BJYryev3pN08e9rzW1dJWf_SlBnnF9kmuOzEqfshlbWNV0YWmWj_ZJadJIJw2v6uvD88DTB2WMSo7sNqTBOvvsUQ5AoV/s1600/c2.PNG"
  alt: "Flare-On Challenge 2017 Writeup"
  relative: false
canonicalURL: "https://sdkhere.blogspot.com/2017/10/flare-on-challenge-2017-writeup.html"
ShowToc: true
TocOpen: false
---

Flare-On is an annual CTF-style challenge organized by FireEye with a focus on reverse engineering.  
Overall, there were 12 challenges to complete. Instead of a detailed write-up, I am just covering the important parts.  
Following are the instructions to solve these challenges:  
1. Analyse the sample and find the key  
2. Each key looks like an email address and ends with @flare-on.com  
3. Enter the key for each challenge in the Flare-On CTF app to unlock the next challenge  
4. Complete all the puzzles and win a prize  
  
Flare-On 2017 challenges - [download](http://flare-on.com/files/Flare-On4_Challenges.zip)  
Password - flare  
  
  
**Challenge 1 : Login.html**  
 The first challenge was very simple. There is an HTML file having a text input form. We need to provide the flag to check for its correctness.  
  
Here is the content of login.html  
  

```
<!DOCTYPE Html />
<html>
    <head>
        <title>FLARE On 2017</title>
    </head>
    <body>
        <input type="text" name="flag" id="flag" value="Enter the flag" />
        <input type="button" id="prompt" value="Click to check the flag" />
        <script type="text/javascript">
            document.getElementById("prompt").onclick = function () {
                var flag = document.getElementById("flag").value;
                var rotFlag = flag.replace(/[a-zA-Z]/g, function(c){return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);});
                if ("PyvragFvqrYbtvafNerRnfl@syner-ba.pbz" == rotFlag) {
                    alert("Correct flag!");
                } else {
                    alert("Incorrect flag, rot again");
                }
            }
        </script>
    </body>
</html>
```

  
By looking at c.charCodeAt(0) + 13 we can say that it is the algorithm for ROT-13.  
It is taking the input, performs ROT-13 and compares it with "PyvragFvqrYbtvafNerRnfl@syner-ba.pbz".  
So, we can say our key is encoded with ROT-13.  
To decode this, we can use [online converter](http://www.asciitohex.com/). Just put the encoded key in the ROT13 section, and you will get the decoded key.  
Key : ClientSideLoginsAreEasy@flare-on.com  
  
 **Challenge 2 : IgniteMe.exe**  
 This is a crackme challenge. It is a command line tool, takes an input from the user and checks whether it is correct or not.  
In the function 401050, you can see where the input is processed by a XOR loop.  
[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjJuzTsZjGI2vAMKnHcwMwOBzBQY5I4vYN2RoFyc6AMzR1TAk_2BJYryev3pN08e9rzW1dJWf_SlBnnF9kmuOzEqfshlbWNV0YWmWj_ZJadJIJw2v6uvD88DTB2WMSo7sNqTBOvvsUQ5AoV/s640/c2.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjJuzTsZjGI2vAMKnHcwMwOBzBQY5I4vYN2RoFyc6AMzR1TAk_2BJYryev3pN08e9rzW1dJWf_SlBnnF9kmuOzEqfshlbWNV0YWmWj_ZJadJIJw2v6uvD88DTB2WMSo7sNqTBOvvsUQ5AoV/s1600/c2.PNG)  
  
The XOR key is hardcoded, which is 0x4. This function XORs the input data with 0x4 in reverse order and compares it against the hardcoded encrypted data.  
So, we have the encrypted data and encryption key, and we know the algorithm.  
Here is the python script to get the key.  
  

```
enc = bytearray.fromhex("000D2649452A1778442B6C5D5E45122F172B446F6E56095F454773260A0D1317484201404D0C0269")
key = 0x4
out = ""
for i in range(len(enc)-1, 0, -1):
 out += chr(enc[i] ^ key)
 key = enc[i] ^ key
print out
print out[::-1]
```

  
Key : R\_y0u\_H0t\_3n0ugH\_t0\_1gn1t3@flare-on.com  
  
  
**Challenge 3 : greek\_to\_me.exe**  
 The executable will start a listening socket on port 2222 and wait to receive data in a small buffer.  
When you reverse engineer the binary, you will see the buffer is transferred to an 8-bit register, which means the input is an ASCII character ranging from 0x0 to 0xff.  
  
With the help of this character it performs some operation on data at 0x40107c.  
You can see the code at 0x401029.  
  
[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj4YUCy3BfdQo9vuJBkTlbaxUkNgGC5ekXAxLvZxuHpFPDKEF_ImF67vLjWdF3Pt0XmfdfxBWxadT5nTfXI4oDSlg5jx2F2IKlzvd_c-KX6mbpWp20-LwfpX4-uIl6_Rwf8nB-DpKOQdkYZ/s640/c3.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj4YUCy3BfdQo9vuJBkTlbaxUkNgGC5ekXAxLvZxuHpFPDKEF_ImF67vLjWdF3Pt0XmfdfxBWxadT5nTfXI4oDSlg5jx2F2IKlzvd_c-KX6mbpWp20-LwfpX4-uIl6_Rwf8nB-DpKOQdkYZ/s1600/c3.PNG)  
  
To decrypt the data properly we need the correct input character.  
We have to create a client for this binary, brute-force the input from 0 to 0xff and print the output.  
Here I have implemented the below client in python.  
  

```
import os
import socket
import subprocess

HOST = 'localhost'
PORT = 2222
ADDR = (HOST,PORT)
BUFSIZE = 4

for byte in range(0xff):

 subprocess.Popen(r"C:\Users\IEUser\Desktop\script\greek_to_me.exe")

 bytes = chr(byte)
 print hex(byte)

 client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
 client.connect(ADDR)

 client.send(bytes)
 while True:
  data = client.recv(100)
  if not data:
   break
  print data

 client.close()
```

  
If the byte is correct we will get the output like "Congratulations! But wait, where',27h,'s my flag?".  
We will get this message at byte 0xa2; so our final byte is 0xa2.  
Now, we have the data at 0x40107c, we have the XOR key 0xa2 and we know the operations.  
So, I have written below python code to get the key.  
  

```
data = bytearray.fromhex("33E1C49911068116F0329FC49117068114F0068115F1C4911A06811BE2068118F2068119F106811EF0C4991FC4911C06811DE6068162EF068163F2068160E3C49961068166BC068167E6068164E80681659D06816AF2C4996B068168A9068169EF06816EEE06816FAE06816CE306816DEF068172E90681737C")

for key in range(1, 0xff):
 data1 = bytearray(0x80)
 for i in range(len(data)):
  print data[i]
  print key
  data1[i] = data[i] ^ key
  data1[i] = data1[i] + 0x22
 print data1
```

  
Key = et\_tu\_brute\_force@flare-on.com  
  
 **Challenge 4 : notepad.exe**  
 This binary is an infected notepad.exe which is patched with some other code.  
At the start, it searches for the files in "%USERPROFILE%/flareon2016challenge" directory.  
This was the hint; we need [Flare-On 2016](http://flare-on.com/files/Flare-On3_Challenges.zip) binaries to solve this challenge.  
  
The loop at 0x1014EAD performs a lookup in the directory and calls the function at 0x1014E20 when a file is found.  
This loop checks the executable files in the directory, takes the timedatestamp of the file and compares it to a hardcoded timedatestamp. If these two values are the same, then the below two functions are called successively.  
1. Function at 0x1014350: It will format the timestamp of the mapped file and display it through MessageBox.  
2. Function at 0x1014BAC: It will open a file *key.bin* in the *flareon2015challenge* directory and write 8 bytes from some offset of the mapped file.  
  
Look at the pseudo code of function2.  
  
[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiyHD1sRDDYQEF1ybuoOqKUAWfMpReM7udrRJIQuUAH9otIlqUMTIP34byH0YUauANiTcp7Qq5xgW9Is5JO1Q06g5EW6uuaK1NKU8Zt_6Y9UegpKlVi4iaE7Xna6W8gxjuSUHap_koFlHm4/s640/c4.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiyHD1sRDDYQEF1ybuoOqKUAWfMpReM7udrRJIQuUAH9otIlqUMTIP34byH0YUauANiTcp7Qq5xgW9Is5JO1Q06g5EW6uuaK1NKU8Zt_6Y9UegpKlVi4iaE7Xna6W8gxjuSUHap_koFlHm4/s1600/c4.PNG)  
  
It is comparing the timestamp of a file with a hardcoded value.  
So if you check the timestamps of the first 4 challenges of Flare-On 2016, you will get the idea.  
Just put those 4 files in the directory and tweak notepad.exe to update its timestamp.  
After 4 executions we get the key.bin properly filled.  
When you update notepad.exe with the last timestamp, you get the key.  
  
[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiYpmeBhAgMaOBV6eLXGWx-w3dcKzMnCdnVPEZvT8W6HdxxVZCeK0rMKyMN3oGUaZYaR4oG2iVVwVxJODtf3MlLLEwkuNty8YDBfO710P1LYJiD9mqFZcY4hLTPJCbNVXcVB6rQlOxrhGLn/s400/c4b.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiYpmeBhAgMaOBV6eLXGWx-w3dcKzMnCdnVPEZvT8W6HdxxVZCeK0rMKyMN3oGUaZYaR4oG2iVVwVxJODtf3MlLLEwkuNty8YDBfO710P1LYJiD9mqFZcY4hLTPJCbNVXcVB6rQlOxrhGLn/s1600/c4b.png)  
  
Key : bl457\_fr0m\_th3\_p457@flare-on.com  
  
 **Challenge 5 : pewpewboat.exe**  
 It is not a PE file but an x64 ELF file, a hidden ship game.  
An 8x8 grid is provided; some of the cells have a ship hidden.  
The task is to complete all the levels.  
  
When you execute the file you will see the below screen.  
  

```
Loading first pew pew map...
   1 2 3 4 5 6 7 8
  _________________
A |_|_|_|_|_|_|_|_|
B |_|_|_|_|_|_|_|_|
C |_|_|_|_|_|_|_|_|
D |_|_|_|_|_|_|_|_|
E |_|_|_|_|_|_|_|_|
F |_|_|_|_|_|_|_|_|
G |_|_|_|_|_|_|_|_|
H |_|_|_|_|_|_|_|_|

Rank: Seaman Recruit

Welcome to pewpewboat! We just loaded a pew pew map, start shootin'!

Enter a coordinate:
```

  
We just have to enter the right coordinate and make some letters.  
You can take a snapshot after completion of a level, because we have limited shots and if we lose we have to start from the beginning.  
  
Here are the sequences of characters that I found.  
FHGUZREJVO  
  
  

```
   1 2 3 4 5 6 7 8 
A |_|_|_|_|_|_|_|_|
B |_|X|X|X|X|X|_|_|
C |_|_|_|X|_|_|_|_|
D |_|_|_|X|_|_|_|_|
E |_|_|_|X|_|_|_|_|
F |X|_|_|X|_|_|_|_|
G |_|X|X|_|_|_|_|_|
H |_|_|_|_|_|_|_|_|
```

  
On completing all the levels, it displays the following message.  
Aye! You found some letters did ya? To find what you're looking for, you'll want to re-order them: 9, 1, 2, 7, 3, 5, 6, 5, 8, 0, 2, 3, 5, 6, 1, 4. Next you let 13 ROT in the sea! THE FINAL SECRET CAN BE FOUND WITH ONLY THE UPPER CASE.  
  
As given in the message, we ROT-13 the letters and we get BUTWHEREISTHERUM.  
Providing this to the application, we can get the key.  
  
Key : y0u\_\_sUnK\_mY\_\_P3Wp3w\_b04t@flare-on.com  
  
 **Challenge 6 : payload.dll**  
 This DLL has only one export function named EntryPoint.  
When we execute this function using rundll32, we get the below message box.  
[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi4SidiLIs_3__bU-1wFcQ_FitktsIlVHCSPDHg4xcGnBPpEbz69SAC9GHHpLjQjPCGpWIyJW5Pk4lMXQuIbnwDNB3juyXTI0GoVQ-kH4rdRV-M-VMYxj86xm3bT3FmIePuNbVs0gLnz86W/s400/c6_msg.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi4SidiLIs_3__bU-1wFcQ_FitktsIlVHCSPDHg4xcGnBPpEbz69SAC9GHHpLjQjPCGpWIyJW5Pk4lMXQuIbnwDNB3juyXTI0GoVQ-kH4rdRV-M-VMYxj86xm3bT3FmIePuNbVs0gLnz86W/s1600/c6_msg.PNG)  
  
Here is the hint; we have to provide some argument to this DLL.  
Let's have a look at the code of the export function.  
The loop at 0x180005B05 is like strcmp() comparing arg1 to the value from the DLL.  
  
When you break at this location, we can get the value to which our argument is compared.  
The argument is compared with "orphanedirreproducibleconfidence". Let's change the argument value and make this condition satisfied.  
So in the last it shows a message box with the key part of 1 byte.  
  
[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiDiqHgtxKu_l7mvDfzRwq7SGoBIW5WvU2iMe2dLN7g6CJ0fITdDKPAj9wCjQChJ8fy6YWrkF3QOafsbDuSD8Du6zqsIuh9aLb0l0eddR9hjnWQDPcDa_xI-dpqymPxm__oIFusFwRf-LU2/s400/msgbox.JPG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiDiqHgtxKu_l7mvDfzRwq7SGoBIW5WvU2iMe2dLN7g6CJ0fITdDKPAj9wCjQChJ8fy6YWrkF3QOafsbDuSD8Du6zqsIuh9aLb0l0eddR9hjnWQDPcDa_xI-dpqymPxm__oIFusFwRf-LU2/s1600/msgbox.JPG)  
  
Now let's go back in reverse, to where this argument value is coming from.  
The answer is in the function at 0x180005D30; let's check the pseudo code of this function.  
  
[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgSZsrNfiLgywag5shc-L27NXF2tnv3E1p2j2ZA50g8DgQ3vzDJonIdialOTxEmBfPCUjeqKuXPO3dzzT_ytxWleFroYv6tpDdxtCTFjtMt0bO7-8HjIz7Ff0mpEvCkrNSjWOLoZwC6q99w/s640/c6_source.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgSZsrNfiLgywag5shc-L27NXF2tnv3E1p2j2ZA50g8DgQ3vzDJonIdialOTxEmBfPCUjeqKuXPO3dzzT_ytxWleFroYv6tpDdxtCTFjtMt0bO7-8HjIz7Ff0mpEvCkrNSjWOLoZwC6q99w/s1600/c6_source.PNG)  
  
So, the index 25 is coming from sub\_180004760(); it gives the value 25 if executed in September.  
For the argument value, let's check sub\_180005C40()  
  

```
int __fastcall sub_180005C40(unsigned int a1)
{
  __int64 v2; // [sp+0h] [bp-58h]@4
  unsigned int i; // [sp+20h] [bp-38h]@1
  int v4; // [sp+24h] [bp-34h]@1
  __int64 *v5; // [sp+28h] [bp-30h]@1
  __int64 v6; // [sp+30h] [bp-28h]@3
  DWORD flOldProtect; // [sp+38h] [bp-20h]@1
  __int64 v8; // [sp+40h] [bp-18h]@4
  unsigned int v9; // [sp+60h] [bp+8h]@1

  v9 = a1;
  v4 = 0x52414E44;
  sub_180007900(a1 + 0x52414E44);
  VirtualProtect(&qword_180001000[64 * (unsigned __int64)v9], 0x200ui64, 0x40u, &flOldProtect);
  v5 = &qword_180001000[64 * (unsigned __int64)v9];
  for ( i = 0; i < 0x200ui64; ++i )
  {
    v6 = i;
    *((_BYTE *)v5 + i) ^= sub_1800078D4();
  }
  return sub_180005E90((unsigned __int64)&v2 ^ v8);
}
```

  
This function is for making the argument value; it takes encrypted data from address 0x180001000 and decrypts it using a XOR loop.  
The argument passed to this function is 25, which means it will always take the last 0x200 bytes of data. So we need to modify this parameter during debugging.  
It will use the 25th key to decrypt the 25th region and reveal the 25th part of the key.  
  
Repeat this procedure with the index from 0 to 24, and you will get each part of the key through a message box.  
  
key[0] = 0x77  
key[1] = 0x75  
key[2] = 0x75  
key[3] = 0x75  
key[4] = 0x74  
key[5] = 0x2d  
key[6] = 0x65  
key[7] = 0x78  
key[8] = 0x79  
key[9] = 0x30  
key[10] = 0x72  
key[11] = 0x74  
key[12] = 0x73  
key[13] = 0x40  
  
We will stop at '@' as we know it has to end with @flare-on.com  
  
Key : wuuut-exp0rts@flare-on.com  
  
**To be continued...**

---
title: "Flare-On Challenge 2018 Writeup"
date: 2018-10-01T02:30:00+05:30
slug: "flare-on-challenge-2018-writeup"
draft: false
cover:
  image: "/images/flare-on-challenge-2018-writeup/code-745d3572.jpg"
  alt: "Flare-On Challenge 2018 Writeup"
  relative: false
canonicalURL: "https://sdkhere.blogspot.com/2018/10/flare-on-challenge-2018-writeup.html"
ShowToc: true
TocOpen: false
---

Flare-On is an annual CTF challenge organized by FireEye with a focus on reverse engineering.  
Overall, there were 12 challenges to complete, similar to [last year (2017)](https://www.sdkhere.com/2017/10/flare-on-challenge-2017-writeup.html). Instead of a detailed write-up, I am just covering the important parts.  
Following are the instructions to solve these challenges:  
1. Analyse the sample and find the key  
2. Each key looks like an email address and ends with @flare-on.com  
3. Enter the key for each challenge in Flare-on CTF app to unlock next challenge  
4. Complete all the puzzles and win a prize  
  
Flare-On 2018 challenges - [download](http://flare-on.com/files/Flare-On5_Challenges.zip)  
Password - flare  
  
   
 **Challenge** 1 :**MinesweeperChampionshipRegistration.jar**  
 The first challenge is very simple. There is a JAR file which asks for an invitation code to proceed.  
I have used the [Jd-gui tool](https://github.com/java-decompiler/jd-gui/releases/download/v1.4.0/jd-gui-windows-1.4.0.zip) to check the code of the JAR file. It just compares the input directly to the hard-coded key.  
  
  

[![](/images/flare-on-challenge-2018-writeup/code-745d3572.jpg)](/images/flare-on-challenge-2018-writeup/code-745d3572.jpg)

  
 key : GoldenTicket2018@flare-on.com  
  
   
 **Challenge 2** :**UltimateMinesweeper.exe**  
   **Challenge 3** :**FLEGGO.zip**  
  
I have solved this challenge statically.  
The zip contains 48 PE files and each one asks for a password. If you enter anything wrong, it displays "Go step on a brick!". So I loaded one file in CFF and found a resource named "BRICK".  

[![](/images/flare-on-challenge-2018-writeup/resource-0c4df235.jpg)](/images/flare-on-challenge-2018-writeup/resource-0c4df235.jpg)

  
 This BRICK is different in each file, so I entered the ASCII of the first 20 bytes from the same file in place of a password. Yes, I guessed it right :)  

[![](/images/flare-on-challenge-2018-writeup/pass-5f510a11.jpg)](/images/flare-on-challenge-2018-writeup/pass-5f510a11.jpg)

  
   
 When we enter the correct password, it drops a PNG file and displays a character associated with it. Here we have "w" and the associated PNG file looks like below.  

[![](/images/flare-on-challenge-2018-writeup/w_13147895-fa369911.png)](/images/flare-on-challenge-2018-writeup/w_13147895-fa369911.png)

So this means the 23rd character of our key will be "w".

I created the below Python script to automate this for every file and extract all the PNGs and their associated characters.

  
  

```
marker = "\x42\x00\x52\x00\x49\x00\x43\x00\x4B\x00\x00\x00\x00\x00"
for file in files:
 filepath = os.path.join(directory, file)
 data = open(filepath, 'rb').read()
 password = data.split(marker)[1][:0x20]
 password = password.replace('\x00','')
 p1 = subprocess.Popen(filepath, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
 res = p1.communicate(input=password)
 res = res[0].split('\r\n')
 png_name = res[2].split('=>')[0].strip()
 charname = res[2].split('=>')[1].strip()
 png_path = os.path.join(directory, png_name)
 new_png_path = os.path.join(directory, charname+'_'+png_name)
 os.rename(png_path, new_png_path)
```

    
Key : mor3\_awes0m3\_th4n\_an\_awes0me\_p0ssum@flare-on.com  

**Challenge 4** :**binstall.exe**   
This is a Confuser-packed .NET binary. After execution, it drops a DLL in %APPDATA%\Microsoft\Internet Explorer\ with the name browserassist.dll and adds its path to the AppInit\_DLLs registry (HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Windows\AppInit\_DLLs). This is one of the DLL injection techniques. AppInit DLLs are loaded by user32.dll after it has been loaded.

When you debug standalone DLL with ollydbg, you will find below code.

[![](/images/flare-on-challenge-2018-writeup/4_1-c04c8735.png)](/images/flare-on-challenge-2018-writeup/4_1-c04c8735.png)

The first function calculates the crc32 of the parent process name and compares it with some hard-coded value. So this DLL must be injected into some specific process; the hint is already given in the instructions, like "especially if they are a Firefox user". So if you replace loaddll.exe with firefox.exe then the checksum will definitely match.

The second function calls the GetVersionInfoA API to fetch the version of the parent process (firefox.exe) and compares it with >55. It requires Firefox of version less than 55 to proceed further, otherwise it will exit.

If both these functions succeed, it will create a thread to proceed further.

This thread downloads base64 encoded and encrypted data from the URL hxxp://pastebin.com/raw/hvaru8NU and decodes and decrypts it using the RC4 algorithm with the key md5("FL@R3ON.EXE"). The decrypted code is a JSON file which looks like below.

[![](/images/flare-on-challenge-2018-writeup/json-78347d59.jpg)](/images/flare-on-challenge-2018-writeup/json-78347d59.jpg)

This is a web injection technique similar to [TinyNuke malware](https://www.bitsighttech.com/blog/break-out-of-the-tinynuke-botnet). At the last, the DLL injects this JSON into Firefox. If the webpage contains the "code" section shown in the JSON, then it will be replaced by the "content" section. At the end of this JSON file, the host and file path are already given.

"path": "/js/view.js",

"host": "\*flare-on.com"

So the web-injection is going to happen on flare-on.com only.

If you open flare-on.com in the infected Firefox you will see the changes in the code.

You have to compare the code of the original site and the infected site and understand what that extra code is doing. It has added an extra command "su" to get the password. It takes the password and compares it with 10 different characters. After RE of that code, you will get the password of size 10 chars.

password : k9btBW7k2y

The story is not over yet. You need to understand the extra piece of code, like what happens when the user is superuser (su). There is a hidden directory named "Key". If you get in there then you will get the key.

cd Key

ls

Key : c0Mm4nD\_inJ3c7ioN@flare-on.com

**Challenge 5** :**web2point0 (wasm)**

This is a very interesting and new challenge.

It contains 3 files: index.html, main.js and test.wasm

The index.html loads main.js and main.js executes the test.wasm file.

The main.js takes the parameter from the URI variable "q" and calls [webassembly](https://en.wikipedia.org/wiki/WebAssembly) (wasm file) with this parameter. If the return value is 1, it will show a party popper, otherwise a Pile of Poo.

I have used Firefox for webassembly debugging.

I appended the parameter in the URL like ?q="abcdefgh" and checked where this parameter is being used by step-by-step debugging. I know this is painful but there was no other way :(

It was comparing each byte of the parameter with some value, I set a breakpoint at the comparison and recorded each value.

[![](/images/flare-on-challenge-2018-writeup/wasm_comp-7e51904d.jpg)](/images/flare-on-challenge-2018-writeup/wasm_comp-7e51904d.jpg)

0xBF2 is where it is comparing parameters with constant values.

Key : wasm\_rulez\_js\_droolz@flare-on.com

**Challenge 6** :**magic**

**[![](/images/flare-on-challenge-2018-writeup/6_1-5d1bdb04.jpg)](/images/flare-on-challenge-2018-writeup/6_1-5d1bdb04.jpg)**

**This loop runs 666 times and it changes the magic file in every iteration.

It asks for the key and when you enter the key it will be processed by sub\_402DCF function only.**

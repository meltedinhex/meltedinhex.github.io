---
title: "Flare-On Challenge 2018 Writeup"
date: 2018-10-01T02:30:00+05:30
slug: "flare-on-challenge-2018-writeup"
draft: false
cover:
  image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgqubfQRNWJCCJHyTMHgJ4dbbLm6S_zatv9dfBZTNtpHrNZaWrcDALncXS-BDQi89xKQsFRqzl68Bs0B0MYW485YAA8EctIIK4KQh3mf4ewl82C02NPK4Xa0cEslPMNMtxTQcwMsvDvCcnj/s1600/code.JPG"
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
  
  

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgqubfQRNWJCCJHyTMHgJ4dbbLm6S_zatv9dfBZTNtpHrNZaWrcDALncXS-BDQi89xKQsFRqzl68Bs0B0MYW485YAA8EctIIK4KQh3mf4ewl82C02NPK4Xa0cEslPMNMtxTQcwMsvDvCcnj/s640/code.JPG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgqubfQRNWJCCJHyTMHgJ4dbbLm6S_zatv9dfBZTNtpHrNZaWrcDALncXS-BDQi89xKQsFRqzl68Bs0B0MYW485YAA8EctIIK4KQh3mf4ewl82C02NPK4Xa0cEslPMNMtxTQcwMsvDvCcnj/s1600/code.JPG)

  
 key : GoldenTicket2018@flare-on.com  
  
   
 **Challenge 2** :**UltimateMinesweeper.exe**  
   **Challenge 3** :**FLEGGO.zip**  
  
I have solved this challenge statically.  
The zip contains 48 PE files and each one asks for a password. If you enter anything wrong, it displays "Go step on a brick!". So I loaded one file in CFF and found a resource named "BRICK".  

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi68itESQ4RkZZnVmQw87AHKaN6qx-Dfvz7PkCeDmlrBCRlMuNjyMQg8xfNq0Ykf0knZJYXxkK4MRdpHL4Gx5C10nHkGsDWwBTfk9gQG84yheX1MP4kkfSyF0C36FhyJwMy0FzUG_ayiJWh/s640/resource.JPG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi68itESQ4RkZZnVmQw87AHKaN6qx-Dfvz7PkCeDmlrBCRlMuNjyMQg8xfNq0Ykf0knZJYXxkK4MRdpHL4Gx5C10nHkGsDWwBTfk9gQG84yheX1MP4kkfSyF0C36FhyJwMy0FzUG_ayiJWh/s1600/resource.JPG)

  
 This BRICK is different in each file, so I entered the ASCII of the first 20 bytes from the same file in place of a password. Yes, I guessed it right :)  

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhD5WcerUZdFqyXq6htN8ECp9NdzUdQbIwyNJthb_rD1j2SXSv92DdfqNdGnnlakRPWOgSMxTTyaWh8cVV3LtpRRGOivJ4RgDnhSUDEpvrtt8IqeEMmZJU5CmWO77yVCCtnCkUvqVZsWYpc/s640/pass.JPG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhD5WcerUZdFqyXq6htN8ECp9NdzUdQbIwyNJthb_rD1j2SXSv92DdfqNdGnnlakRPWOgSMxTTyaWh8cVV3LtpRRGOivJ4RgDnhSUDEpvrtt8IqeEMmZJU5CmWO77yVCCtnCkUvqVZsWYpc/s1600/pass.JPG)

  
   
 When we enter the correct password, it drops a PNG file and displays a character associated with it. Here we have "w" and the associated PNG file looks like below.  

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj-2LG5YhJmNR19rKIcIX5x88mmX_hEDORbJYWSs6KDaLfoQ2cMdTURbyTdQ2LmUusXE_kJjuljvimQZyDaMdURN2GmyqWdcsvQqe4x6sXfDWUiIvrVYABODZZxaw1PVOVxfQmADWdGeBfa/s400/w_13147895.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj-2LG5YhJmNR19rKIcIX5x88mmX_hEDORbJYWSs6KDaLfoQ2cMdTURbyTdQ2LmUusXE_kJjuljvimQZyDaMdURN2GmyqWdcsvQqe4x6sXfDWUiIvrVYABODZZxaw1PVOVxfQmADWdGeBfa/s1600/w_13147895.png)

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

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhTaN9Dcks0wVkAiBSj_PM4RgyF05TOgzCJt8EGgfkJIfugYpGDvy6UWSkwGmAarHwDO3FZ0HKeLO2ABbYbPnylPeTYjaxaPug_uI0X3aBrWnAJ4TkFbyo5Nwyn8u4yHN8zP9nI3J3mCBhb/s640/4_1.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhTaN9Dcks0wVkAiBSj_PM4RgyF05TOgzCJt8EGgfkJIfugYpGDvy6UWSkwGmAarHwDO3FZ0HKeLO2ABbYbPnylPeTYjaxaPug_uI0X3aBrWnAJ4TkFbyo5Nwyn8u4yHN8zP9nI3J3mCBhb/s1600/4_1.PNG)

The first function calculates the crc32 of the parent process name and compares it with some hard-coded value. So this DLL must be injected into some specific process; the hint is already given in the instructions, like "especially if they are a Firefox user". So if you replace loaddll.exe with firefox.exe then the checksum will definitely match.

The second function calls the GetVersionInfoA API to fetch the version of the parent process (firefox.exe) and compares it with >55. It requires Firefox of version less than 55 to proceed further, otherwise it will exit.

If both these functions succeed, it will create a thread to proceed further.

This thread downloads base64 encoded and encrypted data from the URL hxxp://pastebin.com/raw/hvaru8NU and decodes and decrypts it using the RC4 algorithm with the key md5("FL@R3ON.EXE"). The decrypted code is a JSON file which looks like below.

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiVJsUkeRQcbXR8nc4ZMIphBBUJTMJO3nBIQyCJ3kFxxXOaL5Y8NX2CADkmOrzDPG1ajIBUSNwQx9lxEmPaWEDE6zXT8tVopOQEFHyeMmXI8umif75HaHAZPTRWjE3iRP1yA6IwOHmwRmsF/s640/json.JPG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiVJsUkeRQcbXR8nc4ZMIphBBUJTMJO3nBIQyCJ3kFxxXOaL5Y8NX2CADkmOrzDPG1ajIBUSNwQx9lxEmPaWEDE6zXT8tVopOQEFHyeMmXI8umif75HaHAZPTRWjE3iRP1yA6IwOHmwRmsF/s1600/json.JPG)

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

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgCOyFQFuOoSPFyu8Yv6HKp2Tt1g3VoEhOOdrYybyoed7i3eGIuwahumTn9fGl8kmaVWLSQBTv-0jWQQqK1JaInebl5Thw3uhhdnA7DqAH_oJhyphenhyphen7nti_McvoR-FPtOpOROIV1OHj42bCQkV/s640/wasm_comp.JPG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgCOyFQFuOoSPFyu8Yv6HKp2Tt1g3VoEhOOdrYybyoed7i3eGIuwahumTn9fGl8kmaVWLSQBTv-0jWQQqK1JaInebl5Thw3uhhdnA7DqAH_oJhyphenhyphen7nti_McvoR-FPtOpOROIV1OHj42bCQkV/s1600/wasm_comp.JPG)

0xBF2 is where it is comparing parameters with constant values.

Key : wasm\_rulez\_js\_droolz@flare-on.com

**Challenge 6** :**magic**

**[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgPPIG8jSP3Dc-WDCSmSRNcoJscgifEWkVyBeg9OWcPVPARRjrk0pr99NYu6oAV809S9fGntPyKk4EyneAxekw4qFv1WkpnBuWFnBU1-eNHwgK6o__S0dDkfdf8Jj8AtBoHMdCEBBQkfzmP/s640/6_1.JPG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgPPIG8jSP3Dc-WDCSmSRNcoJscgifEWkVyBeg9OWcPVPARRjrk0pr99NYu6oAV809S9fGntPyKk4EyneAxekw4qFv1WkpnBuWFnBU1-eNHwgK6o__S0dDkfdf8Jj8AtBoHMdCEBBQkfzmP/s1600/6_1.JPG)**

**This loop runs 666 times and it changes the magic file in every iteration.

It asks for the key and when you enter the key it will be processed by sub\_402DCF function only.**

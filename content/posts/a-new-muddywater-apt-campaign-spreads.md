---
title: "A new MuddyWater APT campaign spreads Backdoor RAT"
date: 2019-01-11T22:00:00+05:30
slug: "a-new-muddywater-apt-campaign-spreads"
draft: false
tags:
  - "APT"
  - "DotNet"
  - "MS Word"
  - "MSIL"
  - "MuddyWater"
  - "PowerShell"
  - "VBS"
cover:
  image: "/images/a-new-muddywater-apt-campaign-spreads/doc1-85a3eec5.png"
  alt: "A new MuddyWater APT campaign spreads Backdoor RAT"
  relative: false
canonicalURL: "https://sdkhere.blogspot.com/2019/01/a-new-muddywater-apt-campaign-spreads.html"
ShowToc: true
TocOpen: false
---

MuddyWater is an APT group that has been active throughout 2017, targeting victims in the Middle East with in-memory vectors leveraging PowerShell.

In October 2018, Kaspersky Lab published a [good analysis report](https://securelist.com/muddywater/88059/) on the malware by this APT group.

Here I am publishing my analysis report on recent malware by this APT group which targeted several parts of the Middle East.

Sample -  8899c0dac9f6bb73ce750ae7b3250dbd ([Virustotal](https://www.virustotal.com/#/file/c873532e009f2fc7d3b111636f3bbaa307465e5a99a7f4386bebff2ef8a37a20/detection))

References :

https://www.vmray.com/analyses/c873532e009f/report/overview.html

https://twitter.com/360TIC/status/1081080752438009856

https://www.virustotal.com/#/file/c873532e009f2fc7d3b111636f3bbaa307465e5a99a7f4386bebff2ef8a37a20/detection

![](/images/a-new-muddywater-apt-campaign-spreads/doc1-85a3eec5.png)

The document has obfuscated macro code which contains encrypted binary data. On execution, it decrypts the data, drops files and executes them.

The decryption function used in VBS macro is shown below.

[![](/images/a-new-muddywater-apt-campaign-spreads/decrypt_macro-f9b0c3dd.png)](/images/a-new-muddywater-apt-campaign-spreads/decrypt_macro-f9b0c3dd.png)

With the help of this function, it decrypts line(0) of the code shown in the below image, which is nothing but the header of a PE file.

[![](/images/a-new-muddywater-apt-campaign-spreads/file1_enc-37d5b560.png)](/images/a-new-muddywater-apt-campaign-spreads/file1_enc-37d5b560.png)

The macro concatenates the above lines, converts them to ASCII, and stores it at "C:\users\public" with the name "temp\_rt\_32.exe".

After that, it concatenates another piece of code shown below and stores it at the same location with the name "Data.zip"

[![](/images/a-new-muddywater-apt-campaign-spreads/file2_enc-03ff56c0.png)](/images/a-new-muddywater-apt-campaign-spreads/file2_enc-03ff56c0.png)

Location - C:\Users\Public

[![](/images/a-new-muddywater-apt-campaign-spreads/drop_location-9f084ea4.png)](/images/a-new-muddywater-apt-campaign-spreads/drop_location-9f084ea4.png)

After that, the document uses ShellExecute to run temp\_rt\_32.exe and exits itself.

**temp\_rt\_32.exe :**

temp\_rt\_32.exe is a UPX packed Delphi file. On execution, it extracts the data.zip file at %PUBLIC% location and executes "GoogleUpdate.exe"

And then it imports the UP.txt file to the registry, which is nothing but the RUN entry of GoogleUpdate.exe with the name DVRStudio, and exits itself.

[![](/images/a-new-muddywater-apt-campaign-spreads/datazip-5f7ac659.png)](/images/a-new-muddywater-apt-campaign-spreads/datazip-5f7ac659.png)

[![](/images/a-new-muddywater-apt-campaign-spreads/reg-d00a20c0.png)](/images/a-new-muddywater-apt-campaign-spreads/reg-d00a20c0.png)

**GoogleUpdate.exe :**

GoogleUpdate.exe is a RAT which downloads other malware onto the system or uploads the user's files to the command and control server.

First of all, it creates a path ""\\Windows\\Microsoft\\FrameWork4""  in %APPDATA%.

Then it creates a unique machine ID by Base64 of username and Volume serial number.

ID = base64\_encode(username\_volumeserialnumber)

After that, it checks internet connectivity by resolving google.com. If it returns true, it will do the malicious activity, otherwise it will wait for 5 min.

[![](/images/a-new-muddywater-apt-campaign-spreads/internet_chk-7ee345c6.png)](/images/a-new-muddywater-apt-campaign-spreads/internet_chk-7ee345c6.png)

If the internet is connected, then it reads "C:\Users\Public\temp\_gh\_12.dat" which has the following encoded data.

"NAAbYiYadQF4QQAAMXo2Oic7CT4nORx/N3oYKwReWSMEMwAuCGxlX3ZUYmEHEh4+Gz0RPxgVBi8QYBY/aWITJQQGImZ2Y1cLdncHIQ8iHywJMhAgHxgfJRx1GUlvEhl9HRIIUG1wclB9Zw8/AiwQPQYCDmMCOBxv"

[![](/images/a-new-muddywater-apt-campaign-spreads/url_decode-92fdd895.png)](/images/a-new-muddywater-apt-campaign-spreads/url_decode-92fdd895.png)

The above function will Base64 decode the data of temp\_gh\_12.dat, XOR the decoded data with the hardcoded key and then again Base64 decode the decrypted data.

[![](/images/a-new-muddywater-apt-campaign-spreads/xor-f0aff5a5.png)](/images/a-new-muddywater-apt-campaign-spreads/xor-f0aff5a5.png)

Here the key is "UHIRER874893UIUOFUGHEWROUIRGH35"

so after decryption of the temp\_gh\_12.dat file, it shows the below URL.

hxxps://www.jsonstore.io/4de4d6d84d17638b3cd0eaf18857784aff27501be7d3dd89fad2b7ac2134f52e

The sample downloads the JSON file from the above URL and gets the URL of the CnC server.

[![](/images/a-new-muddywater-apt-campaign-spreads/cnc_urls-c88f739e.png)](/images/a-new-muddywater-apt-campaign-spreads/cnc_urls-c88f739e.png)

Above jsonstore api has two CnC URLs. The sample will parse these URLs and proceed with the active one.

When it finds the active URL, it takes the infected machine information, encodes and encrypts it, and stores it at %APPDATA%\\Windows\\Microsoft\\FrameWork4 with the name id\_uniqueID (eg. id\_dXTlbl9DRT).

The information is in below format.

MachineName\_UserName\_UserDomainName\_OperatingSystem\_DateTime\_IPAddress\_ServerURL

Each info is first encoded with Base64 and then XOR encrypted by the hardcoded key.

The sample reads this info from the file and sends it to the CnC server at the below URL.

hxxp://shopcloths.ddns.net/users.php?tname=id\_UniqueID&path=Users

[![](/images/a-new-muddywater-apt-campaign-spreads/info_sent-990dd469.png)](/images/a-new-muddywater-apt-campaign-spreads/info_sent-990dd469.png)

The sample has a Base64 encoded and XOR encrypted PowerShell script which is decrypted by the same encryption and encoding method described above.

[![](/images/a-new-muddywater-apt-campaign-spreads/enc_powershell-02672e55.png)](/images/a-new-muddywater-apt-campaign-spreads/enc_powershell-02672e55.png)

The decrypted PowerShell script looks like below.

[![](/images/a-new-muddywater-apt-campaign-spreads/ps_script-cfd15241.png)](/images/a-new-muddywater-apt-campaign-spreads/ps_script-cfd15241.png)

The first function of the script gives all the usernames available in the system.

The second function will give all the environment variables present in the system path and all the services which are currently running in the system.

ipconfig /all - gives the network info of the system.

The sample runs this script and takes the output, encode and encrypt it with the same method described above and then stores it at %APPDATA%\\Windows\\Microsoft\\FrameWork4\\res\_uniqueID.frk

After that, it reads the same file and sends it to the CnC server at the below location and then deletes the file.

hxxp://shopcloths.ddns.net/users.php?tname=res\_uniqueID.frk&path=Data

[![](/images/a-new-muddywater-apt-campaign-spreads/post_info-3514f1ed.png)](/images/a-new-muddywater-apt-campaign-spreads/post_info-3514f1ed.png)

After all these initialization steps, control transfers to an infinite loop which takes care of all the actions coming from the server and acts accordingly.

[![](/images/a-new-muddywater-apt-campaign-spreads/cnc_loop-5fba598d.png)](/images/a-new-muddywater-apt-campaign-spreads/cnc_loop-5fba598d.png)

This loop first checks the internet connection by pinging google.com, then it checks server connectivity by sending the following request to the server and comparing the output with the hardcoded value.

hxxp://shopcloths.ddns.net/users.php?root=random\_chars

The output of this request should be "wYbaej5avYrFb" which is hardcoded in the sample.

After handshaking, it reads the action command by sending a request to the following server URL with the unique machine ID.

hxxp://shopcloths.ddns.net/users.php?readme=Data/uniqueID

Currently, there are only three commands present in this version.

1. Download Filename URL: It downloads a file from URL and saves it as Filename at %APPDATA%\\Windows\\Microsoft\\FrameWork4

2. Upload FilePath: It uploads FilePath on the server at URL hxxp://shopcloths.ddns.net/users.php?tname=randomname.extension&path=Data

[![](/images/a-new-muddywater-apt-campaign-spreads/cnc_commands-e2110ab7.png)](/images/a-new-muddywater-apt-campaign-spreads/cnc_commands-e2110ab7.png)

3. Powershell script: If the response of the server is an encoded and encrypted PowerShell script, then it will be run by the third function which is shown below.

[![](/images/a-new-muddywater-apt-campaign-spreads/run_ps-9019e195.png)](/images/a-new-muddywater-apt-campaign-spreads/run_ps-9019e195.png)

**IOCs :**

Malicious word document : 8899c0dac9f6bb73ce750ae7b3250dbd

Zip dropper (temp\_rt\_32.exe) : 7C3DD70A4B1976481913E6B5A1FFBB77

Zip File (data.zip) : 5DB43101417247AE161C4425D0B96A70

RAT (GoogleUpdate.exe) : 6F44E57C81414355E3D0D0DAFDF1D80E

CnC URLs hosted on : hxxps://www.jsonstore.io/4de4d6d84d17638b3cd0eaf18857784aff27501be7d3dd89fad2b7ac2134f52e

CnC URL : hxxp://shopcloths.ddns.net/users.php?

CnC URL : hxxp://getgooogle.hopto.org/users.php?

**Update - 13 Jan 2019**  
 I have found some similar and recent malware on VirusTotal. All these samples have only one embedded PE file (GoogleUpdate.exe) which will be dropped in %TEMP%. In my case, this GoogleUpdate.exe was a .NET file embedded in the data.zip file which was executed by temp\_rt\_32.exe, but here GoogleUpdate.exe is also a .NET file packed with the Enigma Virtual Box packer. Other than this, all the processes and CnC servers are similar.  
Here are the latest documents: (MD5)  
d5f76641176d78477e14fde7ae073752  
f589af2ae8f1ace804ef5745feeb6d5c  
44284b5eb3b6da8c988924907478adbd  
85b3f269251d805d3e2f78d37aeb1744  
92816bd34efb6f8b7149d6c2c1545d6a  
9f092a060381db4ed63d4e96da5c8d54

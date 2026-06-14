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
  image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgRS7ga1tHBHr6HMtC8kNusPvlBhtbiAzV6QlPVFuEGCAlizG3p3_2j-3v-Yt3DAzfsDo8CpBci6kXWGwLllFeDdoYRp_VcA1Kidc5Sdr8WTLhwdzi4iijh6YLbBvpQYm2ZU32aNd79B0IJ/s1600/doc1.PNG"
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

![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgRS7ga1tHBHr6HMtC8kNusPvlBhtbiAzV6QlPVFuEGCAlizG3p3_2j-3v-Yt3DAzfsDo8CpBci6kXWGwLllFeDdoYRp_VcA1Kidc5Sdr8WTLhwdzi4iijh6YLbBvpQYm2ZU32aNd79B0IJ/s640/doc1.PNG)

The document has obfuscated macro code which contains encrypted binary data. On execution, it decrypts the data, drops files and executes them.

The decryption function used in VBS macro is shown below.

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEim7Y75ztW5RgT8LGcKIewvyBmBk4bWPEV5zEnQT2lD51CCgNYuLd1TP3Cx9P7Rf8O3TiOtK_BB_OdJYxIedpAGEkxRhDUavwaq_Gdju0oV2_PrPA0zA4y_EnWZgq_trD8aUhXP90wYjjv4/s400/decrypt_macro.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEim7Y75ztW5RgT8LGcKIewvyBmBk4bWPEV5zEnQT2lD51CCgNYuLd1TP3Cx9P7Rf8O3TiOtK_BB_OdJYxIedpAGEkxRhDUavwaq_Gdju0oV2_PrPA0zA4y_EnWZgq_trD8aUhXP90wYjjv4/s1600/decrypt_macro.PNG)

With the help of this function, it decrypts line(0) of the code shown in the below image, which is nothing but the header of a PE file.

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpUtmarW5jwmw4OVIQyI7KZtEcvzK1DN2ls7ERatTlA_Yz2nI5m_vMUNaziDdJqQx_oEPiVjLXBDm3GpIAM3EqfcqZ6MwgpQHPHUIB00SsyCPKt67PfmY0uPjGJ1ioUrVZk-ombnDjAkOd/s640/file1_enc.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpUtmarW5jwmw4OVIQyI7KZtEcvzK1DN2ls7ERatTlA_Yz2nI5m_vMUNaziDdJqQx_oEPiVjLXBDm3GpIAM3EqfcqZ6MwgpQHPHUIB00SsyCPKt67PfmY0uPjGJ1ioUrVZk-ombnDjAkOd/s1600/file1_enc.PNG)

The macro concatenates the above lines, converts them to ASCII, and stores it at "C:\users\public" with the name "temp\_rt\_32.exe".

After that, it concatenates another piece of code shown below and stores it at the same location with the name "Data.zip"

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhoyDBeHzTbungHsEvTDrkh30mtcqVpoFcVv0YfphNmFUN-wNJPgOfclTspl6KekGEXzNhV0S64OlnwJtaSa50r32WMX_-h01spwkmKv8YDU1Dmbv0fqTsuv41vG3MlC-t08XYNBm8qJgcV/s640/file2_enc.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhoyDBeHzTbungHsEvTDrkh30mtcqVpoFcVv0YfphNmFUN-wNJPgOfclTspl6KekGEXzNhV0S64OlnwJtaSa50r32WMX_-h01spwkmKv8YDU1Dmbv0fqTsuv41vG3MlC-t08XYNBm8qJgcV/s1600/file2_enc.PNG)

Location - C:\Users\Public

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg-OCRSvg3fZblp8mCx_8TT8dBkeSIcKU9a6kShm09XAhz4VJVnkGgqU2kHmuriORZGVF6rnBN6aV8iRyiqTwvfiZyC42EuhphqwGuStu5KEQWGY8F1fVoDNUdpkPWHj-kh_h7glIGUaNAo/s640/drop_location.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg-OCRSvg3fZblp8mCx_8TT8dBkeSIcKU9a6kShm09XAhz4VJVnkGgqU2kHmuriORZGVF6rnBN6aV8iRyiqTwvfiZyC42EuhphqwGuStu5KEQWGY8F1fVoDNUdpkPWHj-kh_h7glIGUaNAo/s1600/drop_location.PNG)

After that, the document uses ShellExecute to run temp\_rt\_32.exe and exits itself.

**temp\_rt\_32.exe :**

temp\_rt\_32.exe is a UPX packed Delphi file. On execution, it extracts the data.zip file at %PUBLIC% location and executes "GoogleUpdate.exe"

And then it imports the UP.txt file to the registry, which is nothing but the RUN entry of GoogleUpdate.exe with the name DVRStudio, and exits itself.

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgNHa2Qt0ZNKEb3YBZwdXMkyP2bwCWHzgaqs4zWDucpA7bTyZ_ZqN56_4wNjUHIiT3n6U2gR3ax19XIuyGI-Mi2b_HxKDORT7k0l0h2DqpF4Pp3d01C15Uqrit6tXNfL_iiMlBNpp76uHyI/s640/datazip.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgNHa2Qt0ZNKEb3YBZwdXMkyP2bwCWHzgaqs4zWDucpA7bTyZ_ZqN56_4wNjUHIiT3n6U2gR3ax19XIuyGI-Mi2b_HxKDORT7k0l0h2DqpF4Pp3d01C15Uqrit6tXNfL_iiMlBNpp76uHyI/s1600/datazip.PNG)

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjCcYb-V3XsTqfeJ15B4t91Dk-YWjRBSK2Y5CKSQ4uTI64GJhpIx65kv30UucWFAzBnniPgTG7Poeil05YAgbGe3dzbw3VO9wQH48q3CCveY8arCrIOj_-DY-EalHUjeez0e1iBu2iIMc55/s640/reg.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjCcYb-V3XsTqfeJ15B4t91Dk-YWjRBSK2Y5CKSQ4uTI64GJhpIx65kv30UucWFAzBnniPgTG7Poeil05YAgbGe3dzbw3VO9wQH48q3CCveY8arCrIOj_-DY-EalHUjeez0e1iBu2iIMc55/s1600/reg.PNG)

**GoogleUpdate.exe :**

GoogleUpdate.exe is a RAT which downloads other malware onto the system or uploads the user's files to the command and control server.

First of all, it creates a path ""\\Windows\\Microsoft\\FrameWork4""  in %APPDATA%.

Then it creates a unique machine ID by Base64 of username and Volume serial number.

ID = base64\_encode(username\_volumeserialnumber)

After that, it checks internet connectivity by resolving google.com. If it returns true, it will do the malicious activity, otherwise it will wait for 5 min.

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjxhXJL0f9COecDSlDnJZJPXiy6XIy0JvRb2Q9vdOqTs3bAnLLPJX925s7d4PAY9EAzxH06k6ttJXWihP6-djf4o-cQO7zDbIEf-GIdQgXmz01U282jsBJT9W7y1pxgiXWvaFmJVnUKG5on/s400/internet_chk.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjxhXJL0f9COecDSlDnJZJPXiy6XIy0JvRb2Q9vdOqTs3bAnLLPJX925s7d4PAY9EAzxH06k6ttJXWihP6-djf4o-cQO7zDbIEf-GIdQgXmz01U282jsBJT9W7y1pxgiXWvaFmJVnUKG5on/s1600/internet_chk.PNG)

If the internet is connected, then it reads "C:\Users\Public\temp\_gh\_12.dat" which has the following encoded data.

"NAAbYiYadQF4QQAAMXo2Oic7CT4nORx/N3oYKwReWSMEMwAuCGxlX3ZUYmEHEh4+Gz0RPxgVBi8QYBY/aWITJQQGImZ2Y1cLdncHIQ8iHywJMhAgHxgfJRx1GUlvEhl9HRIIUG1wclB9Zw8/AiwQPQYCDmMCOBxv"

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEigya90NctpGF4krCefoawDVgdbZOEOxYdrNiFxwv5IMLeqTFoeYp-Z40VejP4DutNPwtbSD-sK4muvliGicAFMvI8N2cV8JiYKqlm73DhEixKpBHN4KoelYofYHnik3IAHbM_-iF9gJVzZ/s640/url_decode.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEigya90NctpGF4krCefoawDVgdbZOEOxYdrNiFxwv5IMLeqTFoeYp-Z40VejP4DutNPwtbSD-sK4muvliGicAFMvI8N2cV8JiYKqlm73DhEixKpBHN4KoelYofYHnik3IAHbM_-iF9gJVzZ/s1600/url_decode.PNG)

The above function will Base64 decode the data of temp\_gh\_12.dat, XOR the decoded data with the hardcoded key and then again Base64 decode the decrypted data.

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg6tYuPEreW3NfvTIICYBv3WikwAT-6UaRc34GHn0F2F-jzD__KVm7BHJilvnrb0XBqHuLOezaT3sFsRvzQVvvzdHtMakaTXIVP5bd6xG-nEb7hKflw_rIbSYwYZcPExl7GUgMJGtrF_8E7/s640/xor.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg6tYuPEreW3NfvTIICYBv3WikwAT-6UaRc34GHn0F2F-jzD__KVm7BHJilvnrb0XBqHuLOezaT3sFsRvzQVvvzdHtMakaTXIVP5bd6xG-nEb7hKflw_rIbSYwYZcPExl7GUgMJGtrF_8E7/s1600/xor.PNG)

Here the key is "UHIRER874893UIUOFUGHEWROUIRGH35"

so after decryption of the temp\_gh\_12.dat file, it shows the below URL.

hxxps://www.jsonstore.io/4de4d6d84d17638b3cd0eaf18857784aff27501be7d3dd89fad2b7ac2134f52e

The sample downloads the JSON file from the above URL and gets the URL of the CnC server.

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiWFUiskVIihJzZDrs1n9wSGbaglqtjX05l-2BnkXGaIStAn_v0cPIbJS6EZ0Y6ymE9jIBU18nxzqLjWY4ffFQjZJKkZiZAek9CSMRDGEBtm6VlGtANdyJ9q987bwhfnNZHcRNPXPtRXzst/s640/cnc_urls.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiWFUiskVIihJzZDrs1n9wSGbaglqtjX05l-2BnkXGaIStAn_v0cPIbJS6EZ0Y6ymE9jIBU18nxzqLjWY4ffFQjZJKkZiZAek9CSMRDGEBtm6VlGtANdyJ9q987bwhfnNZHcRNPXPtRXzst/s1600/cnc_urls.PNG)

Above jsonstore api has two CnC URLs. The sample will parse these URLs and proceed with the active one.

When it finds the active URL, it takes the infected machine information, encodes and encrypts it, and stores it at %APPDATA%\\Windows\\Microsoft\\FrameWork4 with the name id\_uniqueID (eg. id\_dXTlbl9DRT).

The information is in below format.

MachineName\_UserName\_UserDomainName\_OperatingSystem\_DateTime\_IPAddress\_ServerURL

Each info is first encoded with Base64 and then XOR encrypted by the hardcoded key.

The sample reads this info from the file and sends it to the CnC server at the below URL.

hxxp://shopcloths.ddns.net/users.php?tname=id\_UniqueID&path=Users

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgd4njnLqIIFqnqjwiIdfF6fI_VpvdYraztJV4kU87UCkzmbLQrejslK87720l4hZPSiHIo3oNHcUUWT8-Ztm0gg8fKAJiERyJUyKuG0UbCzlV42EKlR0T0obW3lePwKM9X4h53jJkBr2FH/s640/info_sent.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgd4njnLqIIFqnqjwiIdfF6fI_VpvdYraztJV4kU87UCkzmbLQrejslK87720l4hZPSiHIo3oNHcUUWT8-Ztm0gg8fKAJiERyJUyKuG0UbCzlV42EKlR0T0obW3lePwKM9X4h53jJkBr2FH/s1600/info_sent.PNG)

The sample has a Base64 encoded and XOR encrypted PowerShell script which is decrypted by the same encryption and encoding method described above.

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg3LKgd1mt5hjjoYTVGFBKUzT3wiu7Y3GNRy_d3amX7Ub9xZkH2S0UrsLoP393607dEtb_hLtHw6Z5iR5A_qwTVGNxS81Qru_fFRLgBvx9K2WGXbuYhBRAqk1skbFRLSqLW3aDDG5bWvxax/s640/enc_powershell.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg3LKgd1mt5hjjoYTVGFBKUzT3wiu7Y3GNRy_d3amX7Ub9xZkH2S0UrsLoP393607dEtb_hLtHw6Z5iR5A_qwTVGNxS81Qru_fFRLgBvx9K2WGXbuYhBRAqk1skbFRLSqLW3aDDG5bWvxax/s1600/enc_powershell.PNG)

The decrypted PowerShell script looks like below.

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhk1WkUxzx_l1SOwpcuHj4XYLGajfs2wflmU8BVKWt_4AJMf8TPlT-YEsDXPzNVgZSNYRpdmec57Thcoj6y9iDu_ZWPsqrxSh_EDxMY56wC-IrsAhMOoEPauGh1PoIwZoaMsmyk5w3_GRSS/s640/ps_script.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhk1WkUxzx_l1SOwpcuHj4XYLGajfs2wflmU8BVKWt_4AJMf8TPlT-YEsDXPzNVgZSNYRpdmec57Thcoj6y9iDu_ZWPsqrxSh_EDxMY56wC-IrsAhMOoEPauGh1PoIwZoaMsmyk5w3_GRSS/s1600/ps_script.PNG)

The first function of the script gives all the usernames available in the system.

The second function will give all the environment variables present in the system path and all the services which are currently running in the system.

ipconfig /all - gives the network info of the system.

The sample runs this script and takes the output, encode and encrypt it with the same method described above and then stores it at %APPDATA%\\Windows\\Microsoft\\FrameWork4\\res\_uniqueID.frk

After that, it reads the same file and sends it to the CnC server at the below location and then deletes the file.

hxxp://shopcloths.ddns.net/users.php?tname=res\_uniqueID.frk&path=Data

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhKo8j_u9QfbRbL6agtVx1tPCypdEXdY4uhfoinBpPEqWds-CcRcvsgcjv4NC_e2FUhqxDXd4zo9iQraWOKiv1WQrw5G2y2NiIAVPxyOZRyPMQKMUEdrJudSNe0gW0deFOW5OGrEUHJrtBV/s640/post_info.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhKo8j_u9QfbRbL6agtVx1tPCypdEXdY4uhfoinBpPEqWds-CcRcvsgcjv4NC_e2FUhqxDXd4zo9iQraWOKiv1WQrw5G2y2NiIAVPxyOZRyPMQKMUEdrJudSNe0gW0deFOW5OGrEUHJrtBV/s1600/post_info.PNG)

After all these initialization steps, control transfers to an infinite loop which takes care of all the actions coming from the server and acts accordingly.

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiTgHLSftJCwzt28jtbDi72VZ4UXZ3bzljEeD-hAfBipo5QQ6ZZ53PBC0u5WnwHuf8UcJ9hzjpWtm4SMD6NZE8QF7zcSzqzY628l9-NmJttRHmdQ6B6hMxH7pmD8Pvb8smMVICjmGaBgwQp/s640/cnc_loop.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiTgHLSftJCwzt28jtbDi72VZ4UXZ3bzljEeD-hAfBipo5QQ6ZZ53PBC0u5WnwHuf8UcJ9hzjpWtm4SMD6NZE8QF7zcSzqzY628l9-NmJttRHmdQ6B6hMxH7pmD8Pvb8smMVICjmGaBgwQp/s1600/cnc_loop.PNG)

This loop first checks the internet connection by pinging google.com, then it checks server connectivity by sending the following request to the server and comparing the output with the hardcoded value.

hxxp://shopcloths.ddns.net/users.php?root=random\_chars

The output of this request should be "wYbaej5avYrFb" which is hardcoded in the sample.

After handshaking, it reads the action command by sending a request to the following server URL with the unique machine ID.

hxxp://shopcloths.ddns.net/users.php?readme=Data/uniqueID

Currently, there are only three commands present in this version.

1. Download Filename URL: It downloads a file from URL and saves it as Filename at %APPDATA%\\Windows\\Microsoft\\FrameWork4

2. Upload FilePath: It uploads FilePath on the server at URL hxxp://shopcloths.ddns.net/users.php?tname=randomname.extension&path=Data

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhgNVvXzXGGF2iA0JAdoaPsNwdPk8BM31sqDojl3NnSGADo4RH7J3_IdjdLzv7qvqzZrcvrDeREGlAW-TjdujDr76MzatWQBbQEUr_Yax7ATRCS4Y6ao1ubaaER0Ezrmk7DrNJBsh55N_B7/s640/cnc_commands.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhgNVvXzXGGF2iA0JAdoaPsNwdPk8BM31sqDojl3NnSGADo4RH7J3_IdjdLzv7qvqzZrcvrDeREGlAW-TjdujDr76MzatWQBbQEUr_Yax7ATRCS4Y6ao1ubaaER0Ezrmk7DrNJBsh55N_B7/s1600/cnc_commands.PNG)

3. Powershell script: If the response of the server is an encoded and encrypted PowerShell script, then it will be run by the third function which is shown below.

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgmPBBE4kYXr5Ac48rPh2b-cbbjSkPHMBY6d28TqaXa-gAZEoefj0CGge481aShxlU8yh18WbkN03aMGq-ipRs9mEknnfwuIuFQebu9Tu4g_710BAbfRg8q9HSBKibsyNcFj8EeE8ctwsC3/s640/run_ps.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgmPBBE4kYXr5Ac48rPh2b-cbbjSkPHMBY6d28TqaXa-gAZEoefj0CGge481aShxlU8yh18WbkN03aMGq-ipRs9mEknnfwuIuFQebu9Tu4g_710BAbfRg8q9HSBKibsyNcFj8EeE8ctwsC3/s1600/run_ps.PNG)

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

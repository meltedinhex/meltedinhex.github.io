---
title: "Analysis of Ransomware spread by JavaScript"
date: 2016-06-06T22:26:00+05:30
slug: "analysis-of-ransomware-spread-by"
draft: false
tags:
  - "Batch ransomware"
  - "File Crypter"
  - "JavaScript malware"
  - "Ransomware"
  - "Ransomware spread by JavaScript"
cover:
  image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh8RXBLXH05hCI4W7wFzSnb4bwXFt-hUOyYR2jj1LKpLYz-nCcPccKCkJHtehyphenhyphenEIT1f3LsBTH7bf4vvGaSrLRuq1WLdhD0FaOmrnlQgFXk8w1-ORYpV587zG0A6sVib_hW9QPIoM7ohLG7N/s1600/workflow.png"
  alt: "Analysis of Ransomware spread by JavaScript"
  relative: false
canonicalURL: "https://sdkhere.blogspot.com/2016/06/analysis-of-ransomware-spread-by.html"
ShowToc: true
TocOpen: false
---

**Summary:**  

The sample is a JavaScript file. After execution, it downloads a BAT file and an EXE file to run, traverses the computer's files, and encrypts 80 kinds of file extensions including documents, pictures, media, etc. After the encryption, it asks for 0.5 BTC to decrypt the files.  
  
The malware author embeds malicious JavaScript in any kind of input data passed to an application that understands it; the application may be a PDF, SWF, etc.  
  
This kind of JavaScript mostly injects a website and spreads links through social networking, email, etc.  
  
**JavaScript File:**  

MD5 :  [2FABECC77B10B39FF03F221F39F50C6C](https://www.virustotal.com/#/file/f6e2c1b42ce68165fd2cd8580daf47d594c4960fc8fb5cdbf1ec210e3ffae87f/detection)  
File size :  8.70 KB (8905 bytes)  
  
The sample drops the following files in the Temp directory on execution:  
  
1. Executable file  : Downloaded from a network address  
2. BAT file :  Created by itself  
3. TXT file : Created by itself  

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh8RXBLXH05hCI4W7wFzSnb4bwXFt-hUOyYR2jj1LKpLYz-nCcPccKCkJHtehyphenhyphenEIT1f3LsBTH7bf4vvGaSrLRuq1WLdhD0FaOmrnlQgFXk8w1-ORYpV587zG0A6sVib_hW9QPIoM7ohLG7N/s640/workflow.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh8RXBLXH05hCI4W7wFzSnb4bwXFt-hUOyYR2jj1LKpLYz-nCcPccKCkJHtehyphenhyphenEIT1f3LsBTH7bf4vvGaSrLRuq1WLdhD0FaOmrnlQgFXk8w1-ORYpV587zG0A6sVib_hW9QPIoM7ohLG7N/s1600/workflow.png)

Fig1 : Workflow of JavaScript sample

Content of JS file before the de-obfuscation is as follows:

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiWnMDQgomrtALEhyT1o_Te2pMHIuj1ydGr-LisxMcCRAwEfH50ehHYxFt4QMiP-b5iz6LDpdBr5napvS6B6SJ5Bk8CUcTE4WdpImB6OvMsD0YNJETv2WLy6La-YSJUXd6d4J7sU1BwUZP6/s640/obfuscated_js.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiWnMDQgomrtALEhyT1o_Te2pMHIuj1ydGr-LisxMcCRAwEfH50ehHYxFt4QMiP-b5iz6LDpdBr5napvS6B6SJ5Bk8CUcTE4WdpImB6OvMsD0YNJETv2WLy6La-YSJUXd6d4J7sU1BwUZP6/s1600/obfuscated_js.png)  

Fig2 : Obfuscated JS code

After de-obfuscation and decryption of the above code looks like as follows:

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7ctkk9i5cKwlF1ucHpMp1I5YUdvXF2ugq1idWa1uCGPrd_CgpK0lTg0zJcgOihXQeE8tyjvb7-ngM3j1-3UyxFQojPazBXQgohzqaV6Tyxp9yNfhvNGo4xoTDgcSFt43edLuFSLeUQMHX/s640/deobfuscated_js.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7ctkk9i5cKwlF1ucHpMp1I5YUdvXF2ugq1idWa1uCGPrd_CgpK0lTg0zJcgOihXQeE8tyjvb7-ngM3j1-3UyxFQojPazBXQgohzqaV6Tyxp9yNfhvNGo4xoTDgcSFt43edLuFSLeUQMHX/s1600/deobfuscated_js.png)

Fig3 : Deobfuscated JS script

When the user executes the JS file, it downloads an executable file from three network addresses in order to the Temp directory and executes them. If it downloads successfully from the first address, the other two addresses will be skipped.  
The sample downloads an executable file from any of the below websites, which were found to be malicious:  
  
1. Locksmithspringfield.us  
2. thecottagespsychotherapycenter.com  
3. kashfianlaw.com  
  
**Batch File:**  

MD5 :  [49163792F3B8C4F62018670033E9FC82](https://www.virustotal.com/#/file/4637c6b332d640450e7cb3ae6a6b0d7d4451454770699acf364d855e28805267/detection)  
File size :  15.93 KB (16317 bytes)  
  
The Batch file is created by JavaScript file and dropped into the Temp directory.  
  

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEju9Tg2eMgQvRiAoE18qGsAxc29KnoM-1FDpFtgLamzcOWsEB_54meCnfkBbTvYk5xwTwpDH39gveDooVf4qxmqzSsWEdU7ZhqRKrpbhZZtatEpmlxinfyoF1g3Vz5Fy-UZ-epLRHECB46r/s640/js_code_to_create_bat.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEju9Tg2eMgQvRiAoE18qGsAxc29KnoM-1FDpFtgLamzcOWsEB_54meCnfkBbTvYk5xwTwpDH39gveDooVf4qxmqzSsWEdU7ZhqRKrpbhZZtatEpmlxinfyoF1g3Vz5Fy-UZ-epLRHECB46r/s1600/js_code_to_create_bat.png)

Fig4 : JavaScript code for creating BAT file

After the creation of batch file, it looks like:

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjAkf22WgJ1eGPh7hSgxHNzdGZnUO6QKY-ScqhKRAUhUQ4GgXCN4lsFbQXtU6ayjEf5-184JKy1gDBula0aKBmVw5avznNfyJWpreOLtHjkLZminzJ-h56TJnzsD96dV0Xgwvr3me9aWOqZ/s640/bat+file.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjAkf22WgJ1eGPh7hSgxHNzdGZnUO6QKY-ScqhKRAUhUQ4GgXCN4lsFbQXtU6ayjEf5-184JKy1gDBula0aKBmVw5avznNfyJWpreOLtHjkLZminzJ-h56TJnzsD96dV0Xgwvr3me9aWOqZ/s1600/bat+file.png)

Fig5 : BAT file snippet

The batch file has 26 encryption loops.  
Each loop is for encrypting each drive (i.e. A to Z).  
It takes every file on the disk with the extensions shown below and passes it to the executable file as a parameter.  
It calls the executable file (\_crypt.exe) for each file on the disk.  
  

```
*.zip *.rar *.7z *.tar *.gz *.xls *.xlsx *.doc *.docx *.pdf *.rtf *.ppt
*.pptx *.sxi *.odm *.odt *.mpp *.ssh *.pub *.gpg *.pgp *.kdb *.kdbx *.als
*.aup *.cpr *.npr *.cpp *.bas *.asm *.cs *.php *.pas *.vb *.vcproj *.vbproj
*.mdb *.accdb *.mdf *.odb *.wdb *.csv *.tsv *.psd *.eps *.cdr *.cpt *.indd
*.dwg *.max *.skp *.scad *.cad *.3ds *.blend *.lwo *.lws *.mb *.slddrw
*.sldasm *.sldprt *.u3d *.jpg *.tiff *.tif *.raw *.avi *.mpg *.mp4 *.m4v
*.mpeg *.mpe *.wmf *.wmv *.veg *.vdi *.vmdk *.vhd *.dsk
```

  
After the encryption, it deletes the executable file (\_crypt.exe) from the Temp directory and starts the text file (\_readme.txt).  
  

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjtkW-aoTv-hUPeznfI_FeS3ypwm0i5N4EXAB4UcjY3Y614M0FZN4Vuiex2kRaUk_pIfRYkbgp7yaFgqaE21qDNsW6JDfFHN85reuaqSGimjvVshowfdA0wuBphTiSSbTCqKWc5NB-3-YFh/s640/batsnipp.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjtkW-aoTv-hUPeznfI_FeS3ypwm0i5N4EXAB4UcjY3Y614M0FZN4Vuiex2kRaUk_pIfRYkbgp7yaFgqaE21qDNsW6JDfFHN85reuaqSGimjvVshowfdA0wuBphTiSSbTCqKWc5NB-3-YFh/s1600/batsnipp.png)

  
  
Text file has ransom note, it ask for 0.5 BTC to decrypt the files.  
  
[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiSR3TcTa2SpwEw9glpQmVPJd8hvQ4bQpL_FrYUNOhTCa6ny4m0FKZZ6LXgsahJ6hlDdATIkzg10Ewx8IN2QZONs2mKH7ya1Lm1aMwBzlJm-EEr76g039zPbISITUjvzNrcYhUhhAoZrgKg/s640/ransom_note.jpg)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiSR3TcTa2SpwEw9glpQmVPJd8hvQ4bQpL_FrYUNOhTCa6ny4m0FKZZ6LXgsahJ6hlDdATIkzg10Ewx8IN2QZONs2mKH7ya1Lm1aMwBzlJm-EEr76g039zPbISITUjvzNrcYhUhhAoZrgKg/s1600/ransom_note.jpg)

Fig7 : Ransom note

At the end, the batch file makes a run entry for the above text file (\_readme.txt) and deletes itself from the Temp directory.

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhhUrW1n_01WCic7uytCACMLkMwKV_E66USiMKB4kWvdTt-BbHAvM4AeUVTEgo4vD82JC1L9fYo8bU-298ocIJq5A3mNPkBOCfcOxDqNxg3dTYkmToqL1eAZPOg3siEPcTUpQHCF7IKdtZp/s640/runentry.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhhUrW1n_01WCic7uytCACMLkMwKV_E66USiMKB4kWvdTt-BbHAvM4AeUVTEgo4vD82JC1L9fYo8bU-298ocIJq5A3mNPkBOCfcOxDqNxg3dTYkmToqL1eAZPOg3siEPcTUpQHCF7IKdtZp/s1600/runentry.png)

Fig8 : Run entry of ransom note

**Executable file:**

MD5 :  [955FC65F54FA12AFAA5199585D749E67](https://www.virustotal.com/#/file/286f57eb83302eaee7fda4836e4197136f7f9de0b6e4ff3df7649e3bf2f82389/detection)  
  
File size :  2.50 KB (2560 bytes)  
  
The EXE file is downloaded by the JavaScript file and dropped in the Temp directory.  
The file is only executed from the command line with a single parameter.  
  
The executable file is an encryption tool which encrypts a file passed via its parameter; only the batch file is responsible for executing this file.  
  
The sample reads a file, encrypts it with the following encryption logic, and writes the file with the same extension:  
  

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi__gPwJEL6-TBFoRFGDPs53tolDlbKNsLRLVBuK0AqAn8Et8sCuXg2VuOPaS8-93ih5dpopMyRrJyo7aTN_1V12hgdYvTz1p2ieiTauqw4qr8CierKiHZuyKEMIyEux9fJQgLkGnL9P5_M/s640/encryptionlogic.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi__gPwJEL6-TBFoRFGDPs53tolDlbKNsLRLVBuK0AqAn8Et8sCuXg2VuOPaS8-93ih5dpopMyRrJyo7aTN_1V12hgdYvTz1p2ieiTauqw4qr8CierKiHZuyKEMIyEux9fJQgLkGnL9P5_M/s1600/encryptionlogic.png)

Fig9 : Encryption routine

Where, the key is directly present in a .data section of the sample, size of key is 0xFF bytes.
[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg-Uqnr5bhFCS1boBCqHERi-IRdH0shaofH8_2xQAxbfBU8CWlBzuySLgSrp-Nin0hs0BJauXRSldS3rtUse6OE2N447EnHGIyiTtYB7ULIwM8ah8KC3C8ul4yXefv-8372N1t1cewSbupJ/s640/encrypkey.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg-Uqnr5bhFCS1boBCqHERi-IRdH0shaofH8_2xQAxbfBU8CWlBzuySLgSrp-Nin0hs0BJauXRSldS3rtUse6OE2N447EnHGIyiTtYB7ULIwM8ah8KC3C8ul4yXefv-8372N1t1cewSbupJ/s1600/encrypkey.png)

Fig10 : Encryption key shown in data section

**Conclusion :**  
  
Ransomware mostly comes as an executable PE file with a different extension. In this case, it uses JavaScript to avoid detection and prevention by antivirus software. The Trojan downloads the malicious software and executes it without the user's consent.  
The sample encrypts every non-PE file with simple encryption.  
As most ransomware changes the extension of a file after encryption, it is easy to identify the encrypted file and decrypt it. But in this case, the sample encrypts the files but does not change the extension, so it is difficult to identify whether a file is encrypted or not.  
In the future, this kind of JavaScript ransomware might come with a different payload and a complex encryption algorithm.

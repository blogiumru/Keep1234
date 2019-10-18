# What is Keep1234?
This is a password manager with cloud sync.
You can download client and server files to use Keep1234.
The Master key, that used for crypting the database never leaves client and not stores anywhere (expect of your head).
Database is crypted by AES ([Crypro-JS](https://github.com/brix/crypto-js) lib)

# Client (HTML+JS+CSS)
I recommend you to use client-side files with NW.JS and host it on your own HDD (Not remotely!). 

Later I am going to add sources for build Android and iOS apps. But for now you can do it yourselves using https://github.com/slymax/webview.
## How to use?
- During first lanch you have to create a Master-key for crypting the database.
- Then for open the database you need to type the correct master-key.
- You can control cloud sync manually or automatically (if 'Autoupdate' checkbox is checked)
# Server (PHP)
There are just 3 files. All requests to server is procceed by manager.php. It's very simple and understandable (I hope).
## Installing
1. Copy all the files to your server.
2. Be sure files 'main.db' and 'data.txt' are rewritable (chmod 777)
3. Copy full URL to 'manager.php' file and use it in Settings window on the client.

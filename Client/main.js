var notes = {};
var app = {
    mode: 'add', //edit/add
    ind: 0, //Index of note we're editing
    key: '', //Key for editing and crypting
    settings: {},
};




window.onload = function(e) {
    if (!localStorage['settings']) {
        settings.def();
    }

    if (!localStorage['file']) {
        $('login').getElementsByTagName('p')[0].innerHTML = 'Create your Masker-Key'
    }

    settings.iniUI();

    if (app.settings.autoUpdate == 1 && app.settings.serverURL.length > 0) {
        database.checkUpdate();
    }
    $('settings').ondragstart = DragStart;
    $('settings').ondragenter = DragEnter;
    $('settings').ondragover = DragOver;
    $('settings').ondragleave = DragLeave;
    $('settings').ondrop = drop;
    $('loginInput').focus();


    //database.open('');	

    if (window.innerWidth < 570) {
        $('settings').style.webkitTransform = 'translate(-50%, -50%) scale(' + window.innerWidth / 575 + ')';
        $('container').style.webkitTransform = 'translate(-50%, -50%) scale(' + window.innerWidth / 575 + ')';
    }
    window.onresize = function(e) {
        if (window.innerWidth < 570) {
            $('settings').style.webkitTransform = 'translate(-50%, -50%) scale(' + window.innerWidth / 575 + ')';
            $('container').style.webkitTransform = 'translate(-50%, -50%) scale(' + window.innerWidth / 575 + ')';
        }
    }
}




function typing() {
    console.log('a');
    if ($('search').value.trim() == '') {
        var a = $('passnotes').childNodes
        for (var i = 0; i < a.length; i++) {
            a[i].classList.remove('hidden');
        }
        return;
    }
    for (var i in notes.notes) {
        if (notes.notes.hasOwnProperty(i)) {
            if (notes.notes[i].name.toLowerCase().indexOf($('search').value.trim().toLowerCase()) == -1)
                $('n' + i).classList.add('hidden');
            else $('n' + i).classList.remove('hidden');
        }
    }


}

var database = new function() {

    this.load = function(x) {
        localStorage['file'] = x;
        setTimeout(function() {
            window.location.reload();
        }, 500);
    }
    this.create = function(x) {
        app.key = x;
        notes = JSON.parse('{"notes":{"0":{"url":"http://facebook.com/","name":"FaceBook","login":"+362502364","password":"123456"},"1":{"url":"http://google.com/","name":"Google","login":"johnwick327","password":"MyReallyB1gPas$wOrd!!!"},"2":{"url":"http://reddit.com/","name":"Reddit","login":"johnwick","password":"rpO2$Jsa1#"}},"date":"' + Math.ceil(new Date().getTime() / 1000) + '","index":3,"upd":0,"version":"1.0"}');
        database.save(0);
    }
    this.save = function(x) { //0 - Save locally, 1 - Upload to server
        var Mydata = JSON.stringify(notes);
        var zip = new JSZip();
        zip.file("hello.txt", Mydata, {
            compression: "DEFLATE",
            compressionOptions: {
                level: 9
            }
        });
        zip.generateAsync({
            type: "base64",
            compression: "DEFLATE",
            compressionOptions: {
                level: 9
            }
        }).then(function(odsFile) {
            var encryptedAES = CryptoJS.AES.encrypt(odsFile, app.key);

            if (x == 0) {
                var u = 0;
                if (!localStorage['file']) u = 1;
                localStorage['file'] = encryptedAES.toString();
                if (u == 1) database.open(app.key);
            }
            //if autoupload is on
            if (x == 1 || app.settings.autoUpdate == 1) {
                database.upload(encryptedAES.toString());
            }
        });
    }
    this.open = function(x) {
        var d = localStorage['file'];
        var decryptedBytes = CryptoJS.AES.decrypt(d, x);
        try {
            var plaintext = decryptedBytes.toString(CryptoJS.enc.Utf8);
        } catch (e) {
            visLogAni();
            return;
        }
        app.key = x;
        var zip2 = new JSZip();
        zip2.loadAsync(plaintext, {
            base64: true
        }).then(function() {
            zip2.file("hello.txt").async("string").then(function(data) {
                presentSafe(data);
                if (app.settings.lockAfter > 0)
                    setTimeout(function() {
                        window.location.reload()
                    }, app.settings.lockAfter * 60 * 1000)

            });;
        });
    }
    this.download = function(x) {
        var steps = 0;
        var object = {
            'file': 0,
            'dv': 0
        };
        var xmlhttp = getXmlHttp();
        xmlhttp.open('GET', app.settings.serverURL + '?dataFile', true);
        xmlhttp.send();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    object.dv = JSON.parse(xmlhttp.responseText.trim());
                    steps++;
                    if (steps == 2) database.savedb(object);
                }
            }
        };
        var xmlhttp2 = getXmlHttp();
        xmlhttp2.open('GET', app.settings.serverURL + '?fileDB', true);
        xmlhttp2.send();
        xmlhttp2.onreadystatechange = function() {
            if (xmlhttp2.readyState == 4) {
                if (xmlhttp2.status == 200) {
                    object.file = xmlhttp2.responseText.trim();
                    steps++;
                    if (steps == 2) database.savedb(object);
                }
            }
        };
    }
    this.upload = function(x) {
        var form = new FormData();
        var xmlhttp = getXmlHttp();
        form.append("data", x);
        form.append("key", "Belu4560Ska");
        xmlhttp.open('POST', app.settings.serverURL, true);
        //xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        //xmlhttp.send("ver=" + encodeURIComponent(ver())+"&dev=" + encodeURIComponent(dev())+"&agent=" + encodeURIComponent(navigator.userAgent)+"&url=" + param['url']+"&cod=" + param['cod']+"&mess=" + param['des']);
        xmlhttp.send(form);
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    if (xmlhttp.responseText.trim() == 'Succ') {
                        modal.notification('Success!!!', 'good')
                        console.log('Success!!! The database is updated')
                    }
                }
            }
        };
    }
    this.savedb = function(x) {
        //Checking/Validating
        localStorage['ver'] = x.dv.version; //Last download version for comparing
        localStorage['time'] = x.dv.time; //From server received
        if (localStorage['file'] && localStorage['file'].length > 0) {
            localStorage['backup'] = localStorage['file'];
        }
        localStorage['file'] = x.file;
        console.log('Saved');
        modal.notification('The new DB was downloaded', 'good')
        if (app.key) database.open(app.key);
    }
    this.checkUpdate = function(x) {
        var xmlhttp = getXmlHttp();
        xmlhttp.open('GET', app.settings.serverURL + '?dataFile', true);
        xmlhttp.send();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    var a = JSON.parse(xmlhttp.responseText.trim());
                    if (a.version > localStorage.ver) {
                        database.download();
                    } //necessaryUpdate
                }
            }
        };
    }
}

function login(e, x) {
    e = e || window.event;
    if (e.keyCode == 13) {
        if (!localStorage['file']) database.create(x.value.trim());
        else database.open(x.value.trim());
    }
}




function visLogAni() {
    $('wrongKey').style.cssText = '-webkit-animation: shining 0.65s 0s 3 linear';
    setTimeout(function() {
        $('wrongKey').style.cssText = '';
    }, 2000);
}



function status() {
    if (!notes) return;
    var u = new Date(notes.date * 1000)

    $('status').innerHTML = '<b>' + Object.keys(notes.notes).length + '</b> records in base; Last change: ' + parseInt(u.getMonth() + 1) + '/' + u.getDate();
}




function presentSafe(data) {
    if (data)
        notes = JSON.parse(data);
    console.log('Safe is open');

    var out = '';
    for (var i in notes.notes) {
        if (notes.notes.hasOwnProperty(i)) {
            out += '<div id="n' + i + '">\n';
            out += showNote(notes.notes[i], i);
            out += '</div>'
        }
    }
    if (out == '') out = '<p class="empty">No records found</p>';
    $('passnotes').innerHTML = out;
    status();

    $('login').style.opacity = '0';
    setTimeout(function() {
        $('login').style.display = 'none'
    }, 600);

    $('present').style.display = 'block'
    setTimeout(function() {
        $('present').style.opacity = '1';
        $('search').focus();
    }, 300);

}

function showNote(x, y) {
    var u = ''
    if (x.url.length > 3)
        u = (x.url.substr(0, 3) == 'htt' || x.url.substr(0, 3) == 'ftp') ? x.url : 'http://' + x.url;
    else u = '';
    var a = (!u) ? x.name : '<a href="' + u + '" target="_blank">' + x.name + '</a>';
    //URL WAS x.url.replace(new RegExp('/$'),'')
    // data-pwd="'+x.password+'"
    return '			<img src="' + x.url.replace(new RegExp('/$'), '') + '/favicon.ico" alt="" onerror="">\
	<span class="name">' + a + '</span>\
	<span class="url">/</span>\
	<span class="login">' + x.login + '</span>\
	<span class="ctrl">\
		<span class="copy" onclick="note.copy(' + y + ')"></span>\
		<span class="edit" onclick="modal.openForEdit(' + y + ')"></span>\
		<span class="remove" onclick="modal.openForRemove(' + y + ')"></span>\
	</span>\
			'
}


var modal = new function() {
    this.openForAdd = function(x) {
        app.mode = 'add';
        $('container').getElementsByTagName('h1')[0].innerHTML = 'Add new record';
        modal.workNote(1);
    }
    this.openForRemove = function(x) {
        var a = (notes.notes[x].name.trim() != '') ? notes.notes[x].name : notes.notes[x].url;
        modal.dialog(1, 'Deleting of <b>' + a + '</b>', 'note.remove(' + x + ')');
    }
    this.openForEdit = function(x) {
        app.mode = 'edit';
        app.ind = x;
        $('container').getElementsByTagName('h1')[0].innerHTML = 'Edit record';
        $('fName').value = notes.notes[x].name;
        $('fURL').value = notes.notes[x].url;
        $('fLogin').value = notes.notes[x].login;
        $('fPass').value = notes.notes[x].password;
        modal.workNote(1);
    }
    this.workNote = function(x) { //Open and close add-new-record modal window
        if (x == 0) {
            $('status').style.cssText = 'filter: blur(0px);'
            $('panel').style.cssText = 'filter: blur(0px);'
            $('passnotes').style.cssText = 'filter: blur(0px);'
            $('search').style.cssText = 'filter: blur(0px);'
            $('blackback').style.opacity = '0';
            $('container').style.opacity = '0';
            setTimeout(function() {
                $('blackback').style.display = 'none';
                $('container').style.display = 'none'
            }, 700);
            $('fName').value = '';
            $('fURL').value = '';
            $('fLogin').value = '';
            $('fPass').value = '';
        } else {
            $('status').style.cssText = 'filter: blur(3px);'
            $('panel').style.cssText = 'filter: blur(3px);'
            $('passnotes').style.cssText = 'filter: blur(3px);'
            $('search').style.cssText = 'filter: blur(3px);'
            $('blackback').style.display = 'block';
            $('container').style.display = 'block'
            setTimeout(function() {
                $('blackback').style.opacity = '1';
                $('container').style.opacity = '1';
            }, 10);
        }

    }
    this.settings = function(x) { //Open and close add-new-record modal window
        if (x == 0) {
            $('status').style.cssText = 'filter: blur(0px);'
            $('panel').style.cssText = 'filter: blur(0px);'
            $('passnotes').style.cssText = 'filter: blur(0px);'
            $('search').style.cssText = 'filter: blur(0px);'
            $('blackback').style.opacity = '0';
            $('settings').style.opacity = '0';
            setTimeout(function() {
                $('blackback').style.display = 'none';
                $('settings').style.display = 'none'
            }, 700);
            $('fName').value = '';
            $('fURL').value = '';
            $('fLogin').value = '';
            $('fPass').value = '';
        } else {
            $('status').style.cssText = 'filter: blur(3px);'
            $('panel').style.cssText = 'filter: blur(3px);'
            $('passnotes').style.cssText = 'filter: blur(3px);'
            $('search').style.cssText = 'filter: blur(3px);'
            $('blackback').style.display = 'block';
            $('settings').style.display = 'block'
            setTimeout(function() {
                $('blackback').style.opacity = '1';
                $('settings').style.opacity = '1';
            }, 10);
        }

    }
    this.dialog = function(x, y, z) {
        if (x == 0) {
            $('status').style.cssText = 'filter: blur(0px);'
            $('panel').style.cssText = 'filter: blur(0px);'
            $('passnotes').style.cssText = 'filter: blur(0px);'
            $('search').style.cssText = 'filter: blur(0px);'
            $('blackback').style.opacity = '0';
            $('dialog').style.opacity = '0';
            setTimeout(function() {
                $('blackback').style.display = 'none';
                $('dialog').style.display = 'none'
            }, 700);
        } else {
            $('dialog').getElementsByTagName('p')[0].innerHTML = y;
            $('dialog').getElementsByClassName('buttons')[0].innerHTML = '<div onclick="' + z + '">Yes</div><div onclick="modal.dialog(0)">No</div>';
            $('status').style.cssText = 'filter: blur(3px);'
            $('panel').style.cssText = 'filter: blur(3px);'
            $('passnotes').style.cssText = 'filter: blur(3px);'
            $('search').style.cssText = 'filter: blur(3px);'
            $('blackback').style.display = 'block';
            $('dialog').style.display = 'block'
            setTimeout(function() {
                $('blackback').style.opacity = '1';
                $('dialog').style.opacity = '1';
            }, 10);
        }
    }
    this.notification = function(x, cls) {
        $('notification').innerHTML = '<span class="' + cls + '">&#9864;</span> ' + x;
        $('notification').className = 'show';
        setTimeout(function() {
            $('notification').className = '';
        }, 2000);
    }
    this.erase = function() {
        modal.settings(0);
        setTimeout(function() {
            modal.dialog(1, 'Erasing <b>ALL DATA and SETTINGS</b>', 'settings.eraseAll()');
        }, 700);
    }
}


var note = new function() {
    this.remove = function(x) {
        delete notes.notes[x];
        notes.date = Math.ceil(new Date().getTime() / 1000);
        notes.upd++;
        database.save(0);
        modal.dialog(0);
        status();
        $('passnotes').removeChild($('n' + x))
    }

    this.save = function(x) {
        //Check for a new record or editing old one
        if ($('fName').value.trim() == '' && $('fURL').value.trim() == '') {
            modal.notification('Type Name or URL', 'bad');
            return;
        }
        if (app.mode == 'edit')
            note.edit();
        else note.add();
    }
    this.edit = function(x) {
        notes.date = Math.ceil(new Date().getTime() / 1000);
        notes.upd++;
        //If you did not change anything
        var u = notes.notes[app.ind];
        if (u.name == $('fName').value &&
            u.url == $('fURL').value &&
            u.login == $('fLogin').value &&
            u.password == $('fPass').value) {
            modal.notification('No changes!', 'good');
            modal.workNote(0);
            return;
        }
        notes.notes[app.ind].name = $('fName').value;
        notes.notes[app.ind].url = $('fURL').value;
        notes.notes[app.ind].login = $('fLogin').value;
        notes.notes[app.ind].password = $('fPass').value;
        $('n' + app.ind).innerHTML = showNote(notes.notes[app.ind], app.ind);
        database.save(0);
        modal.notification('Edited', 'good');
        modal.workNote(0);
    }
    this.add = function(x) {
        notes.date = Math.ceil(new Date().getTime() / 1000);
        notes.upd++;
        notes.notes[notes.index] = {}
        notes.notes[notes.index].name = $('fName').value;
        notes.notes[notes.index].url = $('fURL').value;
        notes.notes[notes.index].login = $('fLogin').value;
        notes.notes[notes.index].password = $('fPass').value;
        if (Object.keys(notes.notes).length == 1) presentSafe();
        else $('passnotes').innerHTML += '<div id="n' + notes.index + '">' + showNote(notes.notes[notes.index], notes.index) + '</div>'
        notes.index++;
        database.save(0);
        modal.notification('Added', 'good');
        status();
        modal.workNote(0);
    }
    this.copy = function(x) {
        var str = notes.notes[x].password
        const el = document.createElement('textarea');
        el.value = str;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        modal.notification('Copied', 'good');
    }
};

var settings = new function() {
    this.def = function(x) {
        localStorage['settings'] = '{"autoUpdate":0,"passLength":10,"serverURL":"","lockAfter":15,"swVer":"1.0"}';
    }
    this.iniUI = function(x) {
        app.settings = JSON.parse(localStorage['settings']);
        $('sURL').value = app.settings.serverURL;
        $('sAU').checked = (app.settings.autoUpdate == 1) ? true : false;
        $('sPassLength').value = app.settings.passLength
        $('sLockAfter').value = app.settings.lockAfter
    }
    this.save = function(x) {
        var uri = $('sURL').value.trim();
        if (uri.replace(new RegExp(/http(|s){0,1}\:\/\/(\w*){3,40}(\.\w*){1,5}(\/\w*){1,20}\.php/i), '') != '') {
            modal.notification('URL is invalid?', 'bad');
            return;
        }
        app.settings.serverURL = uri;
        app.settings.autoUpdate = ($('sAU').checked) ? 1 : 0;
        app.settings.passLength = $('sPassLength').value;
        app.settings.lockAfter = $('sLockAfter').value;
        localStorage['settings'] = JSON.stringify(app.settings);
        modal.notification('Saved', 'good');
        modal.settings(0);
    }
    this.eraseAll = function(x) {
        localStorage['ver'] = '';
        localStorage['file'] = '';
        localStorage['backup'] = '';
        localStorage['settings'] = '';
        window.location.reload();
    }
    this.downloadDB = function(data, filename, type) {
        var file = new Blob([data.split(/\r?\n/).join("\r\n")], {
            type: type
        });
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }
}




function generatePassword() {
    function repChar(x) {
        for (var i = 0; i < x.length - 1; ++i) {
            if (x.charAt(i) == x.charAt(i + 1)) return false;
        }
        return true;
    }
    var length = app.settings.passLength,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&",
        cifer = "0123456789";
    special = "!@#$%^&";
    retVal = "";
    for (var i = 0; i < length; ++i) {
        if (i == length - 2) retVal += cifer.charAt(Math.floor(Math.random() * cifer.length));
        else if (i == length - 1) retVal += special.charAt(Math.floor(Math.random() * special.length));
        else retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    var k = 0;
    while (k < 250) {
        retVal = retVal.split('').sort(function() {
            return 0.5 - Math.random()
        }).join('');
        if (repChar(retVal)) break
        k++;
    }
    if (retVal == retVal.toLowerCase() ||
        retVal == retVal.toUpperCase()) return generatePassword();
    else return retVal;
}

function genHash(x) {
    return CryptoJS.SHA256(x).toString();
}

function $(x) {
    return document.getElementById(x);
}

function getXmlHttp() {
    var xmlhttp;
    try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (E) {
            xmlhttp = false;
        }
    }
    if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
        xmlhttp = new XMLHttpRequest();
    }
    return xmlhttp;
}



//These functions are for importing a database
function DragStart(e) {
       e.dataTransfer.effectAllowed = 'move';
}

function DragEnter(e) {
    e.stopPropagation();
    e.preventDefault();
     e.dataTransfer.dropEffect = "move";
}

function DragLeave(e) {}

function DragOver(e) {
    e.stopPropagation();
    e.preventDefault();
     e.dataTransfer.dropEffect = "move";
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();
    //e.dataTransfer.setData("text/plain", "Text to drag");
    if (e.dataTransfer.files[0].name.substr(-9, 9) != '.keep1234') {
        modal.notification('This is not a DB file', 'bad');
        return;
    }
    processFiles(e.dataTransfer.files);
}

function processFiles(files, x) {
    x = (!x) ? 'utf-8' : x;
    var file = files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        if (e.target.result.indexOf('\ufffd') > -1) {
            processFiles(files, 'CP1251')
            return;
        }
        modal.notification('The DB was imported', 'good');
        console.log(e.target.result);
        database.load(e.target.result);
    };
    reader.readAsText(file, x);
}

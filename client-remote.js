const net = require('net');
const fs = require('fs');
const path = require('path');

const port = 8123;
const client = new net.Socket();
let files = [];
let promise;

client.setEncoding('utf8');

client.connect(port, function () {
    client.write('REMOTE');
});


client.on('data', function (data) {
    console.log('server: ' + data);
    switch (data) {
        case "DEC":
            client.destroy();
            break;
        case "ACK":
            copyFiles( process.argv[2], 'copy_' + process.argv[3]);
            setTimeout(()=>{
                encodeFiles(process.argv[2], 'encode_' + process.argv[3]);
                setTimeout(()=>{
                    decodeFiles('encode_' + process.argv[3], 'decode_' + process.argv[3]);
                }, 1000);
            }, 1000);
            break;
        case 'NEXT':
            if(files.length >= 1)
                sendFile(files.pop());
            else
                client.destroy();
            break;
        default:
            break;
    }
});

client.on('close', function () {
    console.log('Connection closed');
});

function encodeFiles(source_name, copy_name){
    if(process.argv.length > 3){
        client.write('ENCODE ' + source_name + ' ' + copy_name);
    }
    else throw new Error('Not exists arguments');
}
function decodeFiles(source_name, copy_name) {
    if(process.argv.length > 3){
        client.write('DECODE ' + source_name + ' ' + copy_name);
    }
    else throw new Error('Not exists arguments');
}
function copyFiles(source_name, copy_name){
    if(process.argv.length > 3){
        client.write('COPY ' + source_name + ' ' + copy_name);
    }
    else throw new Error('Not exists arguments');
}

/////
function sendFile(p_path){
    fs.readFile(p_path, (err, data) => {
        if(err) throw err;
        client.write('DATA ' + path.basename(p_path) + ' ' + data.toString('hex'));
    });
}
function fillArray(source_path) {
    fs.readdir(source_path, (err, file_names) => {
        if (err) throw err;
        file_names.forEach((file) => {
            file = source_path + path.sep + file;
            fs.stat(file, (err, stat) => {
                if (err) throw err;
                if (stat.isFile())
                    files.push(file);
                else
                    fillArray(file);
            });
        });
    });
}
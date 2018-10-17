const net = require('net');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const port = 8123;
let logger;

const server = net.createServer((client) => {
    client.id = Date.now();
    logger = fs.createWriteStream('client_' + client.id + '.log');
    logger.write('Client ' + client.id + ' connected\n');
    client.setEncoding('utf8');

    client.on('data', (data) => {
        console.log('Client: ');
        dataHandler(data, client, logger);
    });

    client.on('end', () => logger.write('Client ' + client.id + ' disconnected\n'));
});

server.listen(port, () => {
    console.log(`Server listening on localhost:${port}`);
});

function dataHandler(p_data, client, logger) {
    let data = p_data.split(' ');
    switch (data[0]) {
        case 'FILES':
            client.write('ACK');
            break;
        case 'REMOTE':
            client.write('ACK');
            break;
        case 'COPY':
            copyFiles(data[1], data[2]);
            break;
        case 'ENCODE':
            encodeFile(data[1], data[2]);
            break;
        case 'DECODE':
            decodeFile(data[1], data[2]);
            break;
        case 'DATA':
            createFile(client.id, data[1], data[2]);
            client.write('NEXT');
            break;
        default:
            console.log('Disconnect client!')
            client.write('DEC');
            break;
    }
}

function copyFiles(source_name, copy_name) {
    let sourceStream = fs.createReadStream(source_name);
    let copyStream = fs.createWriteStream(copy_name);
    sourceStream.pipe(copyStream);
}

function encodeFile(source, copy) {
    let sourceStream = fs.createReadStream(source);
    let copyStream = fs.createWriteStream(copy);

    let cipher = crypto.createCipher('aes192', 'genius');

    sourceStream.pipe(cipher).pipe(copyStream);
}

function decodeFile(source, copy) {
    let sourceStream = fs.createReadStream(source);
    let copyStream = fs.createWriteStream(copy);

    let cipher = crypto.createDecipher('aes192', 'genius');

    sourceStream.pipe(cipher).pipe(copyStream);
}

function createFile(p_id, p_name, p_data_hex) {
    if (!fs.existsSync(dir + p_id))
        fs.mkdir(dir + p_id, () => {
            fs.writeFile(dir + p_id + '/' + p_name, Buffer.from(p_data_hex, 'hex'), (err) => {
                if (err) throw err;
                logger.write('Create ' + dir + '/' + + p_id + '/' + p_name + '\n');
            });
        });
    else
        fs.writeFile(dir + p_id + path.sep + p_name, Buffer.from(p_data_hex, 'hex'), (err) => {
            if (err) throw err;
            logger.write('Create ./' + p_id + '/' + p_name + '\n');
        });
}
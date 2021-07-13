'use strict';

const fs = require('fs');
const grpc = require('grpc');
const loader = require('@grpc/proto-loader');

const packageDefinition = loader.loadSync('message.proto', {
  keepCase: false,
  longs: String,
  enums: String, 
  defaults: true,
  oneofs: true
});

const pkg = grpc.loadPackageDefinition(packageDefinition);

const dms = require('./DMS').DMS;

const PORT = 9000;
const server = new grpc.Server();

server.addService(pkg.CreateResource.service, {
  getByFileName: getByFileName,
  getByFolderName: getByFolderName,
  saveFile: saveFile,
  saveFolder: saveFolder
});

server.bind(`localhost:${PORT}`, grpc.ServerCredentials.createInsecure());
console.log(`Welcome, the server is running on port ${PORT}`);
server.start();

function getByFileName(call, callback){

  const md = call.metadata.getMap();
    for (let key in md) {
        console.log(key, md[key]);
    }
  
  const fileName = call.request.fileName;

    for (let i = 0; i < dms.length; i++) {
        if (dms[i].fileName === fileName) {
            callback(null, {file: dms[i]});
            return;
        }
    }

  callback('error');
}

function getByFolderName(call, callback){

  const md = call.metadata.getMap();
    for (let key in md) {
        console.log(key, md[key]);
    }
  
  const folderName = call.request.folderName;

    for (let i = 0; i < dms.length; i++) {
        if (dms[i].folderName === folderName) {
            callback(null, {folder: dms[i]});
            return;
        }
    }

  callback('error');
}

function saveFile(call, callback){
  const md = call.metadata.getMap();
    for (let key in md) {
        console.log(key, md[key]);
    }
    let result = new Buffer(0);
    call.on('data', function (data) {
        result = Buffer.concat([result, data.data]);
        console.log(`Message received with size ${data.data.length}`);
    });

    call.on('end', function() {
        callback(null, {isOk: true});
        console.log(`Total file size: ${result.length} bytes`);
    })
}

function saveFolder(call, callback){
    call.on('data', function (emp) {
      dms.push(emp.employee);
      call.write({employee: emp.employee});
  });
  call.on('end', function () {
      dms.forEach(function (emp) {
          console.log(emp);
      });
      call.end();
  });
}

function save(call, callback){
  
}
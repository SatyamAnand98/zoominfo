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

const employees = require('./DMS').DMS;

const PORT = 9000;
const server = new grpc.Server();

server.addService(pkg.CreateResource.service, {
  getByBadgeNumber: getByBadgeNumber,
  getAll: getAll,
  addPhoto: addPhoto,
  saveAll: saveAll,
  save: save
});

server.bind(`localhost:${PORT}`, grpc.ServerCredentials.createInsecure());
console.log(`Welcome, the server is running on port ${PORT}`);
server.start();

function getByBadgeNumber(call, callback){

  const md = call.metadata.getMap();
    for (let key in md) {
        console.log(key, md[key]);
    }
  
  const badgeNumber = call.request.badgeNumber;

    for (let i = 0; i < employees.length; i++) {
        if (employees[i].badgeNumber === badgeNumber) {
            callback(null, {employee: employees[i]});
            return;
        }
    }

  callback('error');
}

function getAll(call){
  employees.forEach(function(emp) {
    call.write({employee: emp});
});

call.end();
}

function addPhoto(call, callback){
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

function saveAll(call, callback){
    call.on('data', function (emp) {
      employees.push(emp.employee);
      call.write({employee: emp.employee});
  });
  call.on('end', function () {
      employees.forEach(function (emp) {
          console.log(emp);
      });
      call.end();
  });
}

function save(call, callback){
  
}
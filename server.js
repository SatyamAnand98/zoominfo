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

//Services
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

//Function on server side to verify batch id and send it to the client
function getByBadgeNumber(call, callback){

  const md = call.metadata.getMap();
    for (let key in md) {
        console.log(key, md[key]);
    }
  
  //pass batch numbr from client request to the constant badge number
  const badgeNumber = call.request.badgeNumber;

    //goes through employees on for loop to get the one where batch number from client request matches one on employees.js
    for (let i = 0; i < employees.length; i++) {
        if (employees[i].badgeNumber === badgeNumber) {
            callback(null, {employee: employees[i]});
            return;
        }
    }

  callback('error');
}

//get all employees function on server side
function getAll(call){
  employees.forEach(function(emp) {
    call.write({employee: emp});
});

call.end();
}

//stream photo to employee. Processes the chunks of the image
function addPhoto(call, callback){
  const md = call.metadata.getMap();
    for (let key in md) {
        console.log(key, md[key]);
    }
    //buffers and add the pieces of the image
    let result = new Buffer(0);
    call.on('data', function (data) {
        result = Buffer.concat([result, data.data]);
        console.log(`Message received with size ${data.data.length}`);
    });

    //Returns the message informing if streaming was successful and inform size in bytes
    call.on('end', function() {
        callback(null, {isOk: true});
        console.log(`Total file size: ${result.length} bytes`);
    })
}

//bi directional streaming. Client adds new employees holydays and then server returns the message when saved
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

//not in use
function save(call, callback){
  
}
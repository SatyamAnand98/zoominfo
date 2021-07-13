'use strict';
//Same as the other projects we import fs for reading documents, in this case employees.js json
const fs = require('fs');

//Importing GRPC and the proto loader
const grpc = require('grpc');
const loader = require('@grpc/proto-loader');

//reads the proto
const packageDefinition = loader.loadSync('message.proto', {
  keepCase: false,
  longs: String,
  enums: String, 
  defaults: true,
  oneofs: true
});

//Loads the proto file to be used in constant pkg
const pkg = grpc.loadPackageDefinition(packageDefinition);

//Creates server
const PORT = 9000;
console.log(PORT)
const client = new pkg.CreateResource(`localhost:${PORT}`, grpc.credentials.createInsecure());

//Reads command from server
//Use a number for switch option
const option = parseInt(process.argv[2],11);
console.log(option)

switch (option) {
    case 1:
        //Shows the Metadata for user on server side
        sendMetadata(client);
        break;
    case 2:
        //Unary Call, gets employee by id
        getByBadgeNumber(client);
        break;
    case 3:
        //Server streaming call where server sends all the employees
        getAll(client);
        break;
    case 4:
        //Client Streaming request where the client streams to the server
        addPhoto(client);
        break;
    case 5:
        //Bidirectional streaming
        //Stream request and stream response back
        saveAll(client);
        break;
}

//Stream request ti save all these new employees
function saveAll(client) {
    const employees = [
        {
			badgeNumber: 123,
			firstName: "John",
			lastName: "Smith",
			vacationAccrualRate: 1.2,
			vacationAccrued: 0,
		},
		{
			badgeNumber: 234,
			firstName: "Lisa",
			lastName: "Wu",
			vacationAccrualRate: 1.7,
			vacationAccrued: 10,
		}
    ];


    //starts the call and open the channel to send and receive
    const call = client.saveAll();
    call.on('data', function (emp) {
        console.log(emp.employee);
    });
    employees.forEach(function (emp) {
        call.write({employee: emp});
    });
    //inform server to close call
    call.end();
}

function addPhoto(client) {
    const md = new grpc.Metadata();
    md.add('badgenumber', '2080');

    //creates client to send stream message accross (Photo)
    //return error if any or result if streaming is Ok
    const call = client.addPhoto(md, function (err, result) {
        console.log(result);
    });

    //uses fs to read image file
    const stream = fs.createReadStream('Penguins.jpg');
    //Chunk data to send it in different pieces
    stream.on('data', function (chunk) {
        call.write({data: chunk});
    });
    stream.on('end', function () {
        call.end();
    });
}

//starts get all function to retrieve all the employees
function getAll(client) {
    const call = client.getAll({});

    call.on('data', function (data) {
        console.log(data.employee);
    });
}

//metadata function
function sendMetadata(client) {
    const md = new grpc.Metadata();
    md.add('username', 'mvansickle');
    md.add('password', 'password1');

    client.getByBadgeNumber({}, md, function () {});
}

//Gets employee by ID sending parameters in the call (2080 is the employee batch id)
function getByBadgeNumber(client) {
    client.getByBadgeNumber({badgeNumber: 2080}, function (err, response) {
        if (err) {
            console.log(err);
        } else {
            console.log(response.employee);
        }
    });
}
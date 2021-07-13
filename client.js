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

const PORT = 9000;
console.log(PORT)
const client = new pkg.CreateResource(`localhost:${PORT}`, grpc.credentials.createInsecure());

const option = parseInt(process.argv[2],11);
console.log(option)

switch (option) {
    case 1:
        sendMetadata(client);
        break;
    case 2:
        getByBadgeNumber(client);
        break;
    case 3:
        getAll(client);
        break;
    case 4:
        addPhoto(client);
        break;
    case 5:
        saveAll(client);
        break;
}

function saveFile(client) {
    const employees = [
        {
			badgeNumber: 123,
			folderName: "folder1",
			fileName: "file1",
            content:"hello this is test1"
		},
		{
			badgeNumber: 234,
			folderName: "folde2",
			fileName: "file2",
            content: "hello this is test2"
		}
    ];

    const call = client.saveFile();
    call.on('data', function (emp) {
        console.log(emp.employee);
    });
    employees.forEach(function (emp) {
        call.write({employee: emp});
    });
    call.end();
}

function addPhoto(client) {
    const md = new grpc.Metadata();
    md.add('badgenumber', '2080');

    const call = client.addPhoto(md, function (err, result) {
        console.log(result);
    });

    const stream = fs.createReadStream('Penguins.jpg');
    stream.on('data', function (chunk) {
        call.write({data: chunk});
    });
    stream.on('end', function () {
        call.end();
    });
}

function getAll(client) {
    const call = client.getAll({});

    call.on('data', function (data) {
        console.log(data.employee);
    });
}

function sendMetadata(client) {
    const md = new grpc.Metadata();
    md.add('username', 'mvansickle');
    md.add('password', 'password1');

    client.getByBadgeNumber({}, md, function () {});
}

function getByBadgeNumber(client) {
    client.getByBadgeNumber({badgeNumber: 2080}, function (err, response) {
        if (err) {
            console.log(err);
        } else {
            console.log(response.employee);
        }
    });
}
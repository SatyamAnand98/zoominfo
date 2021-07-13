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
        getByFileName(client);
        break;
    case 2:
        getByFolderName(client);
        break;
    case 3:
        saveFile(client);
        break;
    case 4:
        saveFolder(client);
        break;
}

function saveFile(client) {
    const dms = [
        {
			folderName: "folder1",
			fileName: "file1",
            content:"hello this is test1"
		},
		{
			folderName: "folde2",
			fileName: "file2",
            content: "hello this is test2"
		}
    ];

    const call = client.saveFile();
    call.on('data', function (dms) {
        console.log(dms.file);
    });
    dms.forEach(function (dms) {
        call.write({dms: dms});
    });
    call.end();
}

function saveFolder(client) {
    const dms = [
        {
            folderName: "folder6",
            fileName: "file6",
            content:"hello this is test6"
        },
        {
            folderName: "folder7",
            fileName: "file7",
            content: "hello this is test7"
        }
    ];

    const call = client.saveFile();
    call.on('data', function (dms) {
        console.log(dms.file);
    });
    dms.forEach(function (dms) {
        call.write({dms: dms});
    });
    call.end();
}

function getByFileName(client) {
    console.log(client)
    client.GetByFileName({fileName: "file1"}, function (err, response) {
        if (err) {
            console.log(err);
        } else {
            console.log(response.dms);
        }
    });
}

function getByFolderName(client) {
    client.GetByFolderName({folderName: "folder1"}, function (err, response) {
        if (err) {
            console.log(err);
        } else {
            console.log(response.dms);
        }
    });
}
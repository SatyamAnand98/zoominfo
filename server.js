var PROTO_PATH = __dirname + '/functions/serverFunctions.proto';
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
	PROTO_PATH,
	{keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true
	});

var server_proto = grpc.loadPackageDefinition(packageDefinition).serverFunctions;

function sayHello(call, callback){
	callback(null, {message:'Hello'+call.request.name});
}

function main(){
	var server = new grpc.Server();
  server.addService(server_proto.EchoService.service, {sayHello: sayHello});
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
  });
}

main();
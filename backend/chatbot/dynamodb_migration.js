// const { ChatModel } = require('./model');
// const dynamoose = require('dynamoose');

const dynamoose = require('dynamoose');

// Configure AWS region and credentials (if not configured through environment variables)


// Set DynamoDB instance to the Dynamoose DDB instance
dynamoose.aws.ddb.set(ddb);
dynamoose.aws.ddb.local("http://54.175.225.18:8000");

// Define a schema for your DynamoDB table
const CustomerSchema = new dynamoose.Schema({
  userId: String, // Primary key
  username: String,
  email: String,
});

// Define the DynamoDB model based on the schema
const Customer = dynamoose.model('LiveCheck', CustomerSchema);
// Customer.create((error) => {
//   if (error) {
//       console.error(error);
//   } else {
//       console.log("Successfully created table");
//   }
// });


Customer.create({"return": "request"}, (error, request) => {
  if (error) {
      console.error(error);
  } else {
      console.log("DynamoTable create request object:", request);
  }
});

// Create an example item to insert into the table
// const newItem = {
//   userId: '123',
//   username: 'john_doe',
//   email: 'john@example.com',
// };

// UserModel.get({ userId: '123' }, (getItemErr, getItemData) => {
//   if (getItemErr) {
//     console.error('Error retrieving item:', getItemErr);
//   } else {
//     console.log('Retrieved item:', getItemData);
//   }
// });

// Insert the item into the table
// UserModel.create(newItem, (err, user) => {
//   if (err) {
//     console.error('Error inserting item:', err);
//   } else {
//     console.log('Item inserted successfully:', user);

//     // Retrieve the inserted item from the table
//     UserModel.get({ userId: '123' }, (getItemErr, getItemData) => {
//       if (getItemErr) {
//         console.error('Error retrieving item:', getItemErr);
//       } else {
//         console.log('Retrieved item:', getItemData);
//       }
//     });
//   }
// });


// const sdk = dynamoose.aws.sdk; // require("aws-sdk");
// sdk.config.update({
// 	"accessKeyId": "AKID",
// 	"secretAccessKey": "SECRET",
// 	"region": "us-east-1"
// });
// const ddb = new dynamoose.aws.sdk.DynamoDB({"endpoint": "http://54.175.225.18:8000"});
// dynamoose.aws.ddb.set(ddb);
// dynamooseOld.setDDB(ddb);

// // const dynamooseDefaults = {
// //   create: true,
// //   prefix: "Dev",
// //   suffix: "",
// //   waitForActive: true, // Wait for table to be created
// //   waitForActiveTimeout: 180000 // 3 minutes,
// // };

// // const dbUrl = "http://54.175.225.18:8000";
// // // dynamoose.AWS.config.update({
// // //   dynamodb: {
// // //     endpoint: dbUrl
// // //   },
// // //   region: "us-east-1",
// // // });

// console.info("Initializing Dynamoose with defaults: ", dynamooseDefaults);
// // dynamoose.setDefaults(dynamooseDefaults);

// console.info(`setting dynamodb url to ${dbUrl}`);
// //dynamoose.aws.ddb.local(dbUrl);

// async function generateVerificationCode() {

//   const k = new ChatModel({ user_id : '13'});
//   await k.save();

//   const r = await ChatModel.scan({}).exec();
//   console.log(r);

// }

// generateVerificationCode()
// // const AWS = require('aws-sdk')

// // AWS.config.update({ region: 'eu-west-3' });

// // // Declare local variables
// // const dynamo = new AWS.DynamoDB();

// // const params = {
// //     TableName: '', // Put Table NAME here
// //     AttributeDefinitions: [
// //       // required attributes to be used as keys
// //       {
// //         AttributeName: 'id',
// //         AttributeType: 'N'
// //       }
// //     ],
// //     KeySchema: [
// //       {
// //         AttributeName: 'id',
// //         KeyType: 'HASH'
// //       }
// //     ],
// //     ProvisionedThroughput: {
// //       ReadCapacityUnits: 5, // Eventually Consistent Model
// //       WriteCapacityUnits: 5
// //     }
// //   }

// // createTable('', params).then(data => console.log(data))


// // function createTable (params) {
// //   return new Promise((resolve, reject) => {
// //     dynamo.createTable(params, (err, data) => {
// //       if(err) reject(err);
// //       else resolve(data);
// //     })
// //   })
// // }

// // // check the below code with dynamoose
// // ChatModel.createTable((err) => {   
// //   if (err) {
// //     console.error('Error creating table:', err);
// //   } else {
// //     console.log('Table created');
// //   }
// // });
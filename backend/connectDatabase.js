const mongoose = require("mongoose");
const dynamoose = require("dynamoose");
const colors = require("colors");

const connectDatabase = () => {
  mongoose
    .connect(process.env.MONGODB_URL, { useNewUrlParser: true })
    .then((data) => {
      console.log(
        `mongodb connected with server 🚀 : ${data.connection.host}`.green.bold
      );
    })
    .catch((err) => {
      console.error(
        `Detailed MongoDB Connection Error: 
        Message: ${err.message}
        Stack: ${err.stack}`.red.bold
      );
      process.exit(1);
    });

  // // console.log(`dynamoDB connected with server ${process.env.AWS_REGION} 🚀 ` );
  // const ddb = new dynamoose.aws.ddb.DynamoDB({
  // 	"credentials": {
  // 		"accessKeyId": process.env.AWS_DYNAMODB_ACCESS_KEY_ID,
  // 		"secretAccessKey": process.env.AWS_DYNAMODB_SECRET_ACCESS_KEY
  // 	},
  // 	"region": process.env.AWS_REGION // PLEASE CHANGE THIS REGION TO MILAN
  // });
  // dynamoose.aws.ddb.set(ddb);
  //dynamoose.aws.ddb.local("http://52.55.194.100:8000"); // Add Dex Client here
};

module.exports = connectDatabase;

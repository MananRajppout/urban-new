const { S3 } = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

class AWSHelper {
  constructor() {
    this.s3 = new S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    });
    this.bucketName = process.env.BLOGS_BUCKET_NAME;
  }

  generateKey(file) {
    return `${uuidv4()}-${file.name}`;
  }

  async uploadObject(file,bucketName) {
    const key = this.generateKey(file);
    const temporaryFilePath = `/tmp/${key}`;

    // Save the file temporarily
    await file.mv(temporaryFilePath);

    // Upload the temporary file to S3
    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: fs.createReadStream(temporaryFilePath),
      ContentType: file.mimetype,
    };

    const result = await this.s3.upload(uploadParams).promise();

    // Remove the temporary file after uploading to S3
    fs.unlinkSync(temporaryFilePath);

    return result.Location;
  }

  async deleteObject(key,bucketName) {
    const deleteParams = {
      Bucket: bucketName,
      Key: key,
    };

    await this.s3.deleteObject(deleteParams).promise();
  }

  async deleteMultipleObjects(keys,bucketName) {
    const deleteParams = {
      Bucket: bucketName,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: false,
      },
    };

    const deleteResponse = await this.s3.deleteObjects(deleteParams).promise();

    // Check if there are any errors in the delete response
    if (deleteResponse.Errors && deleteResponse.Errors.length > 0) {
      // If there are errors, raise an error with the first error message
      throw new Error(deleteResponse.Errors[0].Message);
    }
  }
}

module.exports = AWSHelper;

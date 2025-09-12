require('dotenv').config();
const crypto = require('crypto');
const handlebars = require('handlebars');
const fs = require('fs');
const mailer = require('nodemailer');
// const {getMailSubject} = require("../templates/subjects");
const path = require('path');
const AWS = require("aws-sdk");


const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    region : process.env.AWS_REGION
});

function getFileType(fileKey) {
    const fileExtension = fileKey.split('.').pop().toLowerCase();
    if (fileExtension === 'pdf') {
      return 'pdf';
    } else if (fileExtension === 'docx') {
      return 'docx';
    } else if (fileExtension === 'txt') {
      return 'txt';
    }
    return 'unknown';
}

function getCurrentTime(){
    return new Date();
}

// const pdf = require('pdf-parse');
// const extractTextFromPDF = async (pdfFilePath) => {
//     const dataBuffer = fs.readFileSync(pdfFilePath);
//     const data = new Uint8Array(dataBuffer);

//     // Use pdf-parse to extract text
//     const result = await pdf(data);
//     return result.text;
// };

function getUniqueFileName() {
    const randomString = generateRandomString(8);
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  
    const fileName = `training_data_${timestamp}.txt`;
    return fileName;
}
  

function generateRandomString(length) {
    const randomBytes = crypto.randomBytes(length);
    return randomBytes.toString('base64').slice(0, length);
}

function futureTimes(mins){
    const current_date = new Date();
    const future_time = new Date(current_date.getTime() + (mins * 60000));

    return future_time;
}

function generateVerificationCode() {
    return Math.floor(1000 + Math.random() * 9000);
}

/* READ TXT FILE IN LOCAL*/
function getStringOfTxtFile(file_path) {
    var response = "";
    try {
        response = fs.readFileSync(file_path, 'utf8');
        fs.unlink(file_path, function (err) {
            if (err) throw err;
                console.log('File deleted!', file_path);
        });
    } catch (err) {
        console.error('Error reading the file:', file_path, err);
    }
    return response;
}


function generateOTP() {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*     SEND MAIL     */
const smtpTransport = mailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_AUTH_USER,
        pass: process.env.SMTP_AUTH_PASSWORD
    }
});

const mailOptions = {
    from: "Urbanchat <info@urbanchat.ai>",
};

function sendMailFun(action, ctx, to){
    try {
        var mail_options = { ...mailOptions };
        mail_options["to"] = to;
        
        // var subject = getMailSubject(action);
        let subject = `Verify your ${ctx.website_name} account`;
        const file_name =   `../templates/${action}.html`;
        const template_path = path.join(__dirname, file_name);

        fs.readFile(template_path, 'utf8', (error, htmlTemplate) => {
            if (error) {
                console.error('Error reading email template:', error);
                return;
            }
            const template = handlebars.compile(htmlTemplate);
            
            const personalizedHtml = template(ctx);
            mail_options["subject"] = subject
            mail_options["html"] = personalizedHtml
            smtpTransport.sendMail(mail_options);
            smtpTransport.close();

        });
        return true;
    } catch(error){
        console.log("sendMailFun Error Message ", error)
    }
    return false;
}

// Function to generate slug from title
function generateSlug (title) {
    // Convert title to lowercase
    const lowercaseTitle = title.toLowerCase();

    // Replace special characters with hyphens
    const slug = lowercaseTitle
        .replace(/[^\w\s-]/g, '') // Remove special characters except for whitespace and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/--+/g, '-') // Replace consecutive hyphens with a single hyphen
        .trim(); // Trim leading and trailing spaces

    return slug;
};


async function readFileFromS3(bucketName, key) {
    const params = {
        Bucket: bucketName,
        Key: key
    };

    try {
        const data = await s3.getObject(params).promise();
        return data.Body.toString('utf-8'); 
    } catch (err) {
        console.error("Error reading file from S3:", err);
        return ""
    }
}

/*  END   SEND MAIL     */


/**
 * Generates a random password with a combination of letters, digits, and special characters.
 * @param {number} length - The length of the generated password.
 * @returns {string} - A random password.
 */
function generateRandomPassword(length = 12) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, chars.length);
        password += chars[randomIndex];
    }
    return password;
}

module.exports = {
    generateRandomString,
    sendMailFun,
    generateVerificationCode,
    futureTimes,
    getFileType,
    getStringOfTxtFile,
    generateOTP,
    getUniqueFileName,
    generateSlug,
    readFileFromS3,
    getCurrentTime,
    generateRandomPassword
};

module.exports = (theFunc) => (req, res, next) => {

    const start = Date.now();
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    Promise.resolve(theFunc(req, res, next))
        .then(() => {
            // Record the end time and calculate the duration
            const duration = Date.now() - start;
            console.log(`Request ${req.method} : [${fullUrl}] took ${duration} ms`);
        })
        .catch((error) => {
            // Handle the error

            const duration = Date.now() - start;
            console.log(`Request with ERROR ${req.method} : [${fullUrl}] took ${duration} ms`);
            console.error('Internal Server Error:', error); 
            res.status(500).send({success:false, message:"Internal server Error"});
        });
};
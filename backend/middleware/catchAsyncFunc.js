module.exports = (theFunc) => (req, res, next) => {
    Promise.resolve(theFunc(req, res, next)).catch((error) => {
        console.error('Internal Server Error:', error); 
    });
};
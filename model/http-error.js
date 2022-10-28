class HttpError extends Error{
    constructor(message , errorCode){
        super(message); // Add msg
        this.code = errorCode; // Add error code
    }
}
module.exports = HttpError;




class ValidationError extends Error {

    constructor(message='Validation Error', errors) {
        super(message);
        this.status = 422;
        this.errors=errors;
    }


}

module.exports = ValidationError;
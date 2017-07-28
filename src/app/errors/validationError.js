

const Ajv = require('ajv');
const localize = require('ajv-i18n');

class ValidationError extends Error {

    constructor(message='Validation Error', errors) {
        super(message);
        this.status = 422;
        this.errors=errors;
    }

    static convertAjvValidationError(err) {
        if (!(err instanceof Ajv.ValidationError)) return err;
        // data is invalid
        // 422
        // logger.info('Validation errors:', err.errors);

        localize.fr(err.errors); // TODO // Use the language request
        const errors = err.errors;
        const errorMapping = errors.reduce((acc, error) => {
            // Error Key
            const key = error.dataPath.slice(1);
            let values = acc[key];
            if (!values) {
                values = [];
                acc[key] = values;
            }
            // Error Value
            const clone = Object.assign({}, error);
            delete clone.dataPath;
            delete clone.schemaPath;
            values.push(clone);
            return acc;
        }, {});
        // logger.info('Validation errors:', errorMapping);
        return new ValidationError(err.message, errorMapping);
    }

}

module.exports = ValidationError;
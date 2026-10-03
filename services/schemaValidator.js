const fs = require("fs");
const path = require("path");

const Ajv = require("ajv-draft-04");
const addFormats = require("ajv-formats");

class SchemaValidator {

    constructor() {

        this.ajv = new Ajv({
            allErrors: true,
            strict: false,
            verbose: true
        });

        addFormats(this.ajv);

        this.requestValidators = {};
        this.responseValidators = {};

        this.loadSchemas();
    }

    //--------------------------------------------
    // Load all JSON schemas
    //--------------------------------------------

    loadSchemas() {

        this.loadFolder(
            path.join(__dirname, "../schemas/requests"),
            this.requestValidators
        );

        this.loadFolder(
            path.join(__dirname, "../schemas/responses"),
            this.responseValidators
        );

        console.log("Schemas Loaded");
    }

    //--------------------------------------------
    // Load one folder
    //--------------------------------------------

    loadFolder(folderPath, validatorMap) {

        if (!fs.existsSync(folderPath))
            return;

        const files = fs.readdirSync(folderPath);

        files.forEach(file => {

            if (!file.endsWith(".json"))
                return;

            try {

                const schema = JSON.parse(
                    fs.readFileSync(
                        path.join(folderPath, file),
                        "utf8"
                    )
                );

                const validate =
                    this.ajv.compile(schema);

                const name =
                    path.basename(file, ".json");

                validatorMap[name] = validate;

                console.log(`Loaded Schema : ${name}`);

            }
            catch (err) {

                console.log(
                    `Schema Error : ${file}`
                );

                console.log(err.message);

            }

        });

    }

    //--------------------------------------------
    // Validate Request
    //--------------------------------------------

    validateRequest(action, payload) {
        // console.log(`Validating Request : ${action}`);

        const validator = this.requestValidators[action];
        // console.log(`Validator Found : ${validator}`);

        if (!validator) {

            return {

                valid: false,

                errors: [
                    {
                        message:
                            `Request schema not found : ${action}`
                    }
                ]

            };

        }
//  console.log(`Validator payload : ${payload}`);
        const valid = validator(payload);
// console.log(`Validator valid : ${valid}`);
        return {

            valid,

            errors: validator.errors || []

        };

    }

    //--------------------------------------------
    // Validate Response
    //--------------------------------------------

    validateResponse(action, payload) {

       

        const validator =
            this.responseValidators[action];

        if (!validator) {

            return {

                valid: false,

                errors: [
                    {
                        message:
                            `Response schema not found : ${action}Response`
                    }
                ]

            };

        }

        const valid = validator(payload);

        return {

            valid,

            errors:
                validator.errors || []

        };

    }

}

module.exports = new SchemaValidator();
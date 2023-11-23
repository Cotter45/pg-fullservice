"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const inquirer = require('inquirer');
const getAllTables_1 = require("./getAllTables");
const joi_1 = __importDefault(require("joi"));
const server_1 = require("./server");
const client_1 = require("./client");
const generator = () => __awaiter(void 0, void 0, void 0, function* () {
    let schemaPath = '';
    let connectionString = '';
    let schema = {};
    try {
        const answerHow = yield inquirer.prompt([
            {
                type: 'list',
                name: 'schemaType',
                message: 'How would you like to provide the schema?',
                choices: ['Schema file', 'PostgreSQL connection string'],
            },
        ]);
        if (answerHow.schemaType === 'Schema file') {
            const answer = yield inquirer.prompt([
                {
                    type: 'input',
                    name: 'schemaPath',
                    message: 'Enter the relative path to the schema file:',
                },
            ]);
            // check if schema file exists, relative to the package.json file
            schemaPath = path_1.default.join(process.cwd(), answer.schemaPath);
            if (!fs_1.default.existsSync(schemaPath)) {
                throw new Error('Schema file does not exist');
            }
            // read schema file
            const schemaFile = fs_1.default.readFileSync(schemaPath, 'utf-8');
            schema = JSON.parse(schemaFile);
        }
        else {
            const answer = yield inquirer.prompt([
                {
                    type: 'input',
                    name: 'connectionString',
                    message: 'Enter the PostgreSQL connection string:',
                },
            ]);
            // check if connection string is valid
            connectionString = answer.connectionString;
            // get schema from database
            const result = yield (0, getAllTables_1.getAllTables)(connectionString);
            if (!result) {
                throw new Error('Invalid connection string');
            }
            schema = result;
        }
        // should validate Schema type
        const validator = joi_1.default.object().pattern(joi_1.default.string(), joi_1.default.array().items(joi_1.default.object({
            column_name: joi_1.default.string(),
            data_type: joi_1.default.string(),
            is_nullable: joi_1.default.string().valid('YES', 'NO'),
            is_foreign_key: joi_1.default.boolean(),
            referenced_table_name: joi_1.default.string().allow(null),
        })));
        const { error } = validator.validate(schema);
        if (error) {
            throw new Error(error.message);
        }
        // answer what eg 'All' or checkbox of the tables
        const tableNames = Object.keys(schema);
        const answerWhat = yield inquirer.prompt([
            {
                type: 'checkbox',
                name: 'tables',
                message: 'What tables would you like to generate?',
                choices: ['All', ...tableNames],
                default: ['All'],
            },
        ]);
        const tables = answerWhat.tables;
        // filter schema to only include tables selected
        if (tables[0] !== 'All') {
            const filteredSchema = {};
            for (const table of tables) {
                filteredSchema[table] = schema[table];
            }
            schema = filteredSchema;
        }
        // list options set 2 = ['server', 'client', 'both']
        const answer2 = yield inquirer.prompt([
            {
                type: 'list',
                name: 'outputType',
                message: 'What would you like to generate?',
                choices: ['Server Code (Full)', 'Client Code (Scaffold)', 'Both'],
            },
        ]);
        const outpuType = answer2.outputType.toLowerCase();
        // prompt for output dir
        const answer3 = yield inquirer.prompt([
            {
                type: 'input',
                name: 'outputDir',
                message: 'Enter the relative path to the output directory:',
                default: `${process.cwd()}/services`,
            },
        ]);
        // check if output dir exists
        const outputDir = answer3.outputDir === `${process.cwd()}/services`
            ? answer3.outputDir
            : path_1.default.join(process.cwd(), answer3.outputDir || 'services');
        if (!fs_1.default.existsSync(outputDir)) {
            if (!fs_1.default.existsSync(path_1.default.join(process.cwd(), 'services'))) {
                fs_1.default.mkdirSync(path_1.default.join(process.cwd(), 'services'));
            }
            else {
                throw new Error('Output directory does not exist');
            }
        }
        // list options set 3 = ['typescript', 'javascript']
        const answer4 = yield inquirer.prompt([
            {
                type: 'list',
                name: 'language',
                message: 'What language would you like to generate?',
                choices: ['Typescript', 'Javascript'],
            },
        ]);
        const language = answer4.language.toLowerCase();
        const folderPath = path_1.default.join(outputDir, 'server');
        const clientPath = path_1.default.join(outputDir, 'client');
        if (language === 'typescript') {
            // SERVER ONLY
            if (outpuType === 'server code (full)') {
                if (!fs_1.default.existsSync(folderPath)) {
                    fs_1.default.mkdirSync(folderPath);
                }
                (0, server_1.generateTypescriptServer)(schema, folderPath);
                // CLIENT ONLY
            }
            else if (outpuType === 'client code (scaffold)') {
                if (!fs_1.default.existsSync(clientPath)) {
                    fs_1.default.mkdirSync(clientPath);
                }
                (0, client_1.generateTypescriptClient)(schema, clientPath);
                // BOTH
            }
            else {
                if (!fs_1.default.existsSync(folderPath)) {
                    fs_1.default.mkdirSync(folderPath);
                }
                if (!fs_1.default.existsSync(clientPath)) {
                    fs_1.default.mkdirSync(clientPath);
                }
                (0, server_1.generateTypescriptServer)(schema, folderPath);
                (0, client_1.generateTypescriptClient)(schema, clientPath);
            }
        }
        else {
            // SERVER ONLY JAVASCRIPT
            if (outpuType === 'server code (full)') {
                if (!fs_1.default.existsSync(folderPath)) {
                    fs_1.default.mkdirSync(folderPath);
                }
                (0, server_1.generateJavascriptServer)(schema, folderPath);
                // CLIENT ONLY JAVASCRIPT
            }
            else if (outpuType === 'client code (scaffold)') {
                if (!fs_1.default.existsSync(clientPath)) {
                    fs_1.default.mkdirSync(clientPath);
                }
                (0, client_1.generateJavascriptClient)(schema, clientPath);
                // BOTH JAVASCRIPT
            }
            else {
                if (!fs_1.default.existsSync(folderPath)) {
                    fs_1.default.mkdirSync(folderPath);
                }
                if (!fs_1.default.existsSync(clientPath)) {
                    fs_1.default.mkdirSync(clientPath);
                }
                (0, server_1.generateJavascriptServer)(schema, folderPath);
                (0, client_1.generateJavascriptClient)(schema, clientPath);
            }
        }
        // write schema to file in output dir
        fs_1.default.writeFileSync(path_1.default.join(outputDir, 'schema.json'), JSON.stringify(schema));
    }
    catch (error) {
        console.log(error);
    }
});
exports.generator = generator;

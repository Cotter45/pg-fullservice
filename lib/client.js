"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJavascriptClient = exports.generateTypescriptClient = void 0;
const fs_1 = __importDefault(require("fs"));
const util_1 = require("./util");
function generateTypescriptClass(schema, path) {
    const className = (0, util_1.snakeToPascal)(schema.tableName);
    let classContent = `class ${className} {\n`;
    // Properties
    schema.columns.forEach((column) => {
        classContent += `    declare ${column.name}: ${(0, util_1.convertDBTypeToTsType)(column.type)};\n`;
    });
    classContent += `\n    constructor(init?: Partial<${className}>) {\n`;
    classContent += `        Object.assign(this, init);\n    }\n\n`;
    // Static
    classContent += `};`;
    fs_1.default.writeFileSync(`${path}/${className}.ts`, classContent);
}
const generateTypescriptClient = (schemaFile, path) => {
    const keys = Object.keys(schemaFile);
    for (const key of keys) {
        const table = schemaFile[key];
        const columns = table.map((column) => ({
            name: column.column_name,
            type: column.data_type,
            isNullable: column.is_nullable,
            isForeignKey: column.is_foreign_key,
            referencedTable: column.referenced_table_name,
        }));
        generateTypescriptClass({
            tableName: key,
            columns,
        }, path);
    }
};
exports.generateTypescriptClient = generateTypescriptClient;
function generateJavascriptClass(schema, path) {
    const className = (0, util_1.snakeToPascal)(schema.tableName);
    let classContent = `class ${className} {\n`;
    // Properties
    schema.columns.forEach((column) => {
        classContent += `    ${column.name};\n`;
    });
    classContent += `\n    constructor(init) {\n`;
    classContent += `        Object.assign(this, init);\n    }\n\n`;
    // Static
    classContent += `};`;
    fs_1.default.writeFileSync(`${path}/${className}.js`, classContent);
}
const generateJavascriptClient = (schemaFile, path) => {
    const keys = Object.keys(schemaFile);
    for (const key of keys) {
        const table = schemaFile[key];
        const columns = table.map((column) => ({
            name: column.column_name,
            type: column.data_type,
            isNullable: column.is_nullable,
            isForeignKey: column.is_foreign_key,
            referencedTable: column.referenced_table_name,
        }));
        generateJavascriptClass({
            tableName: key,
            columns,
        }, path);
    }
};
exports.generateJavascriptClient = generateJavascriptClient;

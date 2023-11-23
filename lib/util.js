"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.snakeToPascal = exports.typeToValue = exports.convertDBTypeToTsType = void 0;
function convertDBTypeToTsType(dbType) {
    switch (dbType.toLowerCase()) {
        case 'integer':
        case 'smallint':
        case 'bigint':
        case 'numeric':
        case 'double precision':
        case 'serial':
            return 'number';
        case 'varchar':
        case 'text':
        case 'char':
        case 'character varying':
            return 'string';
        case 'boolean':
            return 'boolean';
        case 'timestamp':
        case 'timestamp with time zone':
        case 'date':
            return 'Date';
        case 'json':
        case 'jsonb':
            return 'any';
        default:
            console.warn(`Unrecognized DB type: ${dbType}. Defaulting to 'any'.`);
            return 'any';
    }
}
exports.convertDBTypeToTsType = convertDBTypeToTsType;
const typeToValue = (dbType) => {
    const type = convertDBTypeToTsType(dbType);
    switch (type) {
        case 'number':
            return '0';
        case 'string':
            return "''";
        case 'boolean':
            return 'false';
        case 'Date':
            return 'new Date()';
        case 'any':
            return 'null';
        default:
            return "''";
    }
};
exports.typeToValue = typeToValue;
const snakeToPascal = (str) => {
    return str
        .split('_')
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join('');
};
exports.snakeToPascal = snakeToPascal;

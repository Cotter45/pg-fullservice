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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTables = void 0;
const pg_1 = require("pg");
const getTable_1 = require("./getTable");
const getAllTables = (connectionString) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new pg_1.Client({
        connectionString,
    });
    yield client.connect();
    try {
        const query = {
            text: `
        SELECT
          table_name
        FROM INFORMATION_SCHEMA.TABLES
        WHERE table_schema = 'public';
      `,
        };
        const result = yield client.query(query);
        const tables = result.rows
            ? result.rows
                .map((row) => row.table_name)
                .filter((tn) => tn !== 'migrations')
            : [];
        if (tables.length > 0) {
            const tableData = {};
            for (const tableName of tables) {
                const table = yield (0, getTable_1.getTable)(client, tableName);
                if (!table) {
                    continue;
                }
                tableData[tableName] = table;
            }
            return tableData;
        }
    }
    catch (error) {
        console.error(error);
    }
    finally {
        yield client.end();
    }
});
exports.getAllTables = getAllTables;

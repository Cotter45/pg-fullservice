import fs from 'fs';

import { convertDBTypeToTsType, snakeToPascal, typeToValue } from './util';

import type { MappedSpec, Schema, Spec } from './types';

function generateDbFile(path: string, lang: string) {
  if (lang === 'ts') {
    let dbFile = `import { Pool } from 'pg';\n\n`;

    dbFile += `const pool = new Pool({\n`;
    dbFile += `    connectionString: process.env.DATABASE_URL,\n`;
    dbFile += `});\n\n`;

    dbFile += `async function dbQuery<T>({ text, values }: { text: string; values: any[] }): T | null {\n`;
    dbFile += `    const client = await pool.connect();\n`;
    dbFile += `    try {\n`;
    dbFile += `        const result = await client.query<T>(text, values);\n`;
    dbFile += `        if (result.rows.length === 0) {\n`;
    dbFile += `            return null;\n`;
    dbFile += `        }\n`;
    dbFile += `        return result.rows;\n`;
    dbFile += `    } catch (error) {\n`;
    dbFile += `        console.error(error);\n`;
    dbFile += `        return null;\n`;
    dbFile += `    } finally {\n`;
    dbFile += `        client.release();\n`;
    dbFile += `    }\n`;
    dbFile += `}\n\n`;

    dbFile += `export { dbQuery, pool };`;

    fs.writeFileSync(`${path}/db.ts`, dbFile);
  }

  if (lang === 'js') {
    let dbFile = `const { Pool } = require('pg');\n\n`;

    dbFile += `const pool = new Pool({\n`;
    dbFile += `    connectionString: process.env.DATABASE_URL,\n`;
    dbFile += `});\n\n`;

    dbFile += `async function dbQuery({ text, values }) {\n`;
    dbFile += `    const client = await pool.connect();\n`;
    dbFile += `    try {\n`;
    dbFile += `        const result = await client.query(text, values);\n`;
    dbFile += `        if (result.rows.length === 0) {\n`;
    dbFile += `            return null;\n`;
    dbFile += `        }\n`;
    dbFile += `        return result.rows;\n`;
    dbFile += `    } catch (error) {\n`;
    dbFile += `        console.error(error);\n`;
    dbFile += `        return null;\n`;
    dbFile += `    } finally {\n`;
    dbFile += `        client.release();\n`;
    dbFile += `    }\n`;
    dbFile += `}\n\n`;

    dbFile += `module.exports = { dbQuery, pool };`;

    fs.writeFileSync(`${path}/db.js`, dbFile);
  }
}

function generateTypescriptClass(
  schema: {
    tableName: string;
    columns: MappedSpec[];
  },
  path: string,
) {
  let className = snakeToPascal(schema.tableName);

  if (className.endsWith('s')) {
    className = className.slice(0, -1);
  } else if (className.endsWith('ies')) {
    className = className.slice(0, -3) + 'y';
  } else if (className.endsWith('ches')) {
    className = className.slice(0, -2);
  } else if (className.endsWith('oes')) {
    className = className.slice(0, -2);
  }

  const createValidator = `const ${className}Validator = Joi.object({
    ${schema.columns
      .sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (b.name < a.name) {
          return 1;
        }
        return 0;
      })
      .filter((column) => {
        return (
          column.name !== 'id' &&
          !column.name.includes('created') &&
          !column.name.includes('updated') &&
          !column.name.includes('deleted')
        );
      })
      .map((column) => {
        let validator = `${column.name}: `;
        if (column.isNullable === 'YES') {
          validator += `Joi.${convertDBTypeToTsType(
            column.type,
          ).toLowerCase()}().allow(null).allow('')`;
        } else {
          validator += `Joi.${convertDBTypeToTsType(
            column.type,
          ).toLowerCase()}().required()`;
        }
        return validator;
      })
      .join(',\n    ')}
});`;

  const updateValidator = `const ${className}Validator = Joi.object({
    ${schema.columns
      .sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (b.name < a.name) {
          return 1;
        }
        return 0;
      })
      .map((column) => {
        let validator = `${column.name}: `;
        if (column.isNullable) {
          validator += `Joi.${convertDBTypeToTsType(
            column.type,
          ).toLowerCase()}().allow(null).allow('')`;
        } else {
          validator += `Joi.${convertDBTypeToTsType(
            column.type,
          ).toLowerCase()}().required()`;
        }
        return validator;
      })
      .join(',\n    ')}
});`;

  let classContent = `import Joi from 'joi';\n`;
  classContent += `import { dbQuery } from './db';\n\n`;

  classContent += `/**\n`;
  classContent += ` * ${className} Model\n`;
  classContent += ` */\n`;

  classContent += `class ${className} {\n`;

  // Properties
  schema.columns.forEach((column) => {
    classContent += `    declare ${column.name}: ${convertDBTypeToTsType(
      column.type,
    )};\n`;
  });

  classContent += `\n    /**\n`;
  classContent += `     * Create a new ${className}\n`;
  classContent += `     * @param {Partial<${className}>} data\n`;
  classContent += `     * @returns {${className} | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `\n    constructor(init?: Partial<${className}>) {\n`;
  classContent += `        Object.assign(this, init);\n    }\n\n`;

  // CRUD Operations

  // Create
  classContent += `    /**\n`;
  classContent += `     * Create a new ${className}\n`;
  classContent += `     * @param {Partial<${className}>} data\n`;
  classContent += `     * @returns {${className} | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async create(data: Partial<${className}>): Promise<${className} | { message: string }> {\n`;
  classContent += `    ${createValidator}\n\n`;
  classContent += `        const { error } = ${className}Validator.validate(data);\n`;
  classContent += `        if (error) {\n`;
  classContent += `            return { message: error.message };\n`;
  classContent += `        }\n\n`;

  classContent += `        const query = {\n`;
  classContent += `            text: 'INSERT INTO ${
    schema.tableName
  }(${schema.columns
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (b.name < a.name) {
        return 1;
      }
      return 0;
    })
    .filter((column) => {
      return column.name !== 'id';
    })
    .map((column) => column.name)
    .join(', ')}) VALUES(${schema.columns
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (b.name < a.name) {
        return 1;
      }
      return 0;
    })
    .filter((column) => {
      return column.name !== 'id';
    })
    .map((column, index) => `$${index + 1}`)
    .join(', ')}) RETURNING *',\n`;
  classContent += `            values: [${schema.columns
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (b.name < a.name) {
        return 1;
      }
      return 0;
    })
    .filter((column) => {
      return column.name !== 'id';
    })
    .map((column) => `data.${column.name} || ${typeToValue(column.type)}`)
    .join(', ')}]\n`;
  classContent += `        };\n`;
  classContent += `        const result = await dbQuery<${className}>(query);\n`;
  classContent += `        if (!result) {\n`;
  classContent += `            return { message: 'Could not create ${className}' };\n`;
  classContent += `        }\n`;
  classContent += `        return result[0];\n`;
  classContent += `    }\n\n`;

  // Read
  classContent += `    /**\n`;
  classContent += `     * Read a ${className}\n`;
  classContent += `     * @param {number} id\n`;
  classContent += `     * @returns {${className} | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async read(id: number): Promise<${className} | { message: string }> {\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'SELECT * FROM ${schema.tableName} WHERE id = $1',\n`;
  classContent += `            values: [id]\n`;
  classContent += `        };\n`;
  classContent += `        const result = await dbQuery<${className}>(query);\n`;
  classContent += `        if (!result) {\n`;
  classContent += `            return { message: 'Could not find ${className}' };\n`;
  classContent += `        }\n`;
  classContent += `        return result[0];\n`;
  classContent += `    }\n\n`;

  // Paginate
  classContent += `    /**\n`;
  classContent += `     * Paginate ${className}s\n`;
  classContent += `     * @param {number} page\n`;
  classContent += `     * @param {number} limit\n`;
  classContent += `     * @returns {${className}[] | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async paginate(page: number, limit: number): Promise<${className}[] | { message: string }> {\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'SELECT * FROM ${schema.tableName} ORDER BY id DESC LIMIT $1 OFFSET $2',\n`;
  classContent += `            values: [limit, (page - 1) * limit]\n`;
  classContent += `        };\n`;
  classContent += `        const result = await dbQuery<${className}>(query);\n`;
  classContent += `        if (!result) {\n`;
  classContent += `            return { message: 'Could not find ${className}' };\n`;
  classContent += `        }\n`;
  classContent += `        return result;\n`;
  classContent += `    }\n\n`;

  // Get Many
  classContent += `    /**\n`;
  classContent += `     * Get many ${className}s\n`;
  classContent += `     * @param {number[]} ids\n`;
  classContent += `     * @returns {${className}[] | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async getMany(ids: number[]): Promise<${className}[] | { message: string }> {\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'SELECT * FROM ${schema.tableName} WHERE id = ANY($1)',\n`;
  classContent += `            values: [ids]\n`;
  classContent += `        };\n`;
  classContent += `        const result = await dbQuery<${className}>(query);\n`;
  classContent += `        if (!result) {\n`;
  classContent += `            return { message: 'Could not find ${className}' };\n`;
  classContent += `        }\n`;
  classContent += `        return result;\n`;
  classContent += `    }\n\n`;

  // Get All
  classContent += `    /**\n`;
  classContent += `     * Get all ${className}s\n`;
  classContent += `     * @returns {${className}[] | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async getAll(): Promise<${className}[] | { message: string }> {\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'SELECT * FROM ${schema.tableName} ORDER BY id DESC',\n`;
  classContent += `            values: []\n`;
  classContent += `        };\n`;
  classContent += `        const result = await dbQuery<${className}>(query);\n`;
  classContent += `        if (!result) {\n`;
  classContent += `            return { message: 'Could not find ${className}' };\n`;
  classContent += `        }\n`;
  classContent += `        return result;\n`;
  classContent += `    }\n\n`;

  // Update
  classContent += `    /**\n`;
  classContent += `     * Update a ${className}\n`;
  classContent += `     * @param {Partial<${className}>} data\n`;
  classContent += `     * @returns {${className} | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async update(data: Partial<${className}>): Promise<${className} | { message: string }> {\n`;
  classContent += `    ${updateValidator}\n\n`;
  classContent += `        const { error } = ${className}Validator.validate(data);\n`;
  classContent += `        if (error) {\n`;
  classContent += `            return { message: error.message };\n`;
  classContent += `        }\n\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'UPDATE ${
    schema.tableName
  } SET ${schema.columns
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (b.name < a.name) {
        return 1;
      }
      return 0;
    })
    .filter((column) => {
      return column.name !== 'id';
    })
    .map((column, index) => `${column.name} = $${index + 1}`)
    .join(', ')} WHERE id = $${schema.columns.length} RETURNING *',\n`;
  classContent += `            values: [${schema.columns
    .filter((column) => {
      return column.name !== 'id';
    })
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (b.name < a.name) {
        return 1;
      }
      return 0;
    })
    .map((column) => `data.${column.name} || ${typeToValue(column.type)}`)
    .join(', ')}, data.id]\n`;
  classContent += `        };\n`;
  classContent += `        const result = await dbQuery<${className}>(query);\n`;
  classContent += `        if (!result) {\n`;
  classContent += `            return { message: 'Could not update ${className}' };\n`;
  classContent += `        }\n`;
  classContent += `        return result[0];\n`;
  classContent += `    }\n\n`;

  // Delete
  classContent += `    /**\n`;
  classContent += `     * Delete a ${className}\n`;
  classContent += `     * @param {number} id\n`;
  classContent += `     * @returns {${className} | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async delete(id: number): Promise<${className} | { message: string }> {\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'DELETE FROM ${schema.tableName} WHERE id = $1 RETURNING *',\n`;
  classContent += `            values: [id]\n`;
  classContent += `        };\n`;
  classContent += `        const result = await dbQuery<${className}>(query);\n`;
  classContent += `        if (!result) {\n`;
  classContent += `            return { message: 'Could not delete ${className}' };\n`;
  classContent += `        }\n`;
  classContent += `        return result[0];\n`;
  classContent += `    }\n\n`;

  classContent += `}\n\n`;

  classContent += `export default ${className};`;

  fs.writeFileSync(`${path}/${className}.ts`, classContent);
}

export const generateTypescriptServer = (schemaFile: Schema, path: string) => {
  const keys = Object.keys(schemaFile);

  for (const key of keys) {
    const table = schemaFile[key];
    const columns = table.map((column: Spec) => ({
      name: column.column_name,
      type: column.data_type,
      isNullable: column.is_nullable,
      isForeignKey: column.is_foreign_key,
      referencedTable: column.referenced_table_name,
    }));

    generateTypescriptClass(
      {
        tableName: key,
        columns,
      },
      path,
    );

    generateDbFile(path, 'ts');
  }
};

function generateJavascriptClass(
  schema: {
    tableName: string;
    columns: MappedSpec[];
  },
  path: string,
) {
  let className = snakeToPascal(schema.tableName);

  if (className.endsWith('s')) {
    className = className.slice(0, -1);
  } else if (className.endsWith('ies')) {
    className = className.slice(0, -3) + 'y';
  } else if (className.endsWith('ches')) {
    className = className.slice(0, -2);
  } else if (className.endsWith('oes')) {
    className = className.slice(0, -2);
  }

  const createValidator = `const ${className}Validator = Joi.object({
    ${schema.columns
      .sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (b.name < a.name) {
          return 1;
        }
        return 0;
      })
      .filter((column) => {
        return (
          column.name !== 'id' &&
          !column.name.includes('created') &&
          !column.name.includes('updated') &&
          !column.name.includes('deleted')
        );
      })
      .map((column) => {
        let validator = `${column.name}: `;
        if (column.isNullable === 'YES') {
          validator += `Joi.${convertDBTypeToTsType(
            column.type,
          ).toLowerCase()}().allow(null).allow('')`;
        } else {
          validator += `Joi.${convertDBTypeToTsType(
            column.type,
          ).toLowerCase()}().required()`;
        }
        return validator;
      })
      .join(',\n    ')}
});`;

  const updateValidator = `const ${className}Validator = Joi.object({
    ${schema.columns
      .sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (b.name < a.name) {
          return 1;
        }
        return 0;
      })
      .map((column) => {
        let validator = `${column.name}: `;
        if (column.isNullable) {
          validator += `Joi.${convertDBTypeToTsType(
            column.type,
          ).toLowerCase()}().allow(null).allow('')`;
        } else {
          validator += `Joi.${convertDBTypeToTsType(
            column.type,
          ).toLowerCase()}().required()`;
        }
        return validator;
      })
      .join(',\n    ')}
});`;

  let classContent = `const Joi = require('joi');\n`;
  classContent += `const { dbQuery } = require('./db');\n\n`;

  classContent += `/**\n`;
  classContent += ` * ${className} Model\n`;
  classContent += ` */\n`;

  classContent += `class ${className} {\n`;

  // Properties
  schema.columns.forEach((column) => {
    classContent += `    ${column.name};\n`;
  });

  classContent += `\n    constructor(init) {\n`;
  classContent += `        Object.assign(this, init);\n    }\n\n`;

  // CRUD Operations

  // Create
  classContent += `    /**\n`;
  classContent += `     * Create a new ${className}\n`;
  classContent += `     * @param {Partial<${className}>} data\n`;
  classContent += `     * @returns {${className} | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async create(data) {\n`;
  classContent += `    ${createValidator}\n\n`;
  classContent += `        const { error } = ${className}Validator.validate(data);\n`;
  classContent += `        if (error) {\n`;
  classContent += `            return { message: error.message };\n`;
  classContent += `        }\n\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'INSERT INTO ${
    schema.tableName
  }(${schema.columns
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (b.name < a.name) {
        return 1;
      }
      return 0;
    })
    .filter((column) => {
      return column.name !== 'id';
    })
    .map((column) => column.name)
    .join(', ')}) VALUES(${schema.columns
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (b.name < a.name) {
        return 1;
      }
      return 0;
    })
    .filter((column) => {
      return column.name !== 'id';
    })
    .map((column, index) => `$${index + 1}`)
    .join(', ')}) RETURNING *',\n`;
  classContent += `            values: [${schema.columns
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (b.name < a.name) {
        return 1;
      }
      return 0;
    })
    .filter((column) => {
      return column.name !== 'id';
    })
    .map((column) => `data.${column.name} || ${typeToValue(column.type)}`)
    .join(', ')}]\n`;
  classContent += `        };\n`;
  classContent += `        const result = await dbQuery(query);\n`;
  classContent += `        if (!result) {\n`;
  classContent += `            return { message: 'Could not create ${className}' };\n`;
  classContent += `        }\n`;
  classContent += `        return result[0];\n`;
  classContent += `    }\n\n`;

  // Read
  classContent += `    /**\n`;
  classContent += `     * Read a ${className}\n`;
  classContent += `     * @param {number} id\n`;
  classContent += `     * @returns {${className} | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async read(id) {\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'SELECT * FROM ${schema.tableName} WHERE id = $1',\n`;
  classContent += `            values: [id]\n`;
  classContent += `        };\n`;
  classContent += `        const result = await dbQuery(query);\n`;
  classContent += `        if (!result) {\n`;
  classContent += `            return { message: 'Could not find ${className}' };\n`;
  classContent += `        }\n`;
  classContent += `        return result[0];\n`;
  classContent += `    }\n\n`;

  // Paginate
  classContent += `    /**\n`;
  classContent += `     * Paginate ${className}s\n`;
  classContent += `     * @param {number} page\n`;
  classContent += `     * @param {number} limit\n`;
  classContent += `     * @returns {${className}[] | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async paginate(page, limit) {\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'SELECT * FROM ${schema.tableName} ORDER BY id DESC LIMIT $1 OFFSET $2',\n`;
  classContent += `            values: [limit, (page - 1) * limit]\n`;
  classContent += `        };\n`;
  classContent += `        const result = await dbQuery(query);\n`;
  classContent += `        if (!result) {\n`;
  classContent += `            return { message: 'Could not find ${className}' };\n`;
  classContent += `        }\n`;
  classContent += `        return result;\n`;
  classContent += `    }\n\n`;

  // Get Many
  classContent += `    /**\n`;
  classContent += `     * Get many ${className}s\n`;
  classContent += `     * @param {number[]} ids\n`;
  classContent += `     * @returns {${className}[] | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async getMany(ids) {\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'SELECT * FROM ${schema.tableName} WHERE id = ANY($1)',\n`;
  classContent += `            values: [ids]\n`;
  classContent += `        };\n`;
  classContent += `        const result = await dbQuery(query);\n`;
  classContent += `        if (!result) {\n`;
  classContent += `            return { message: 'Could not find ${className}' };\n`;
  classContent += `        }\n`;
  classContent += `        return result;\n`;
  classContent += `    }\n\n`;

  // Get All
  classContent += `    /**\n`;
  classContent += `     * Get all ${className}s\n`;
  classContent += `     * @returns {${className}[] | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async getAll() {\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'SELECT * FROM ${schema.tableName} ORDER BY id DESC',\n`;
  classContent += `            values: []\n`;
  classContent += `        };\n`;
  classContent += `        const result = await dbQuery(query);\n`;
  classContent += `        if (!result) {\n`;
  classContent += `            return { message: 'Could not find ${className}' };\n`;
  classContent += `        }\n`;
  classContent += `        return result;\n`;
  classContent += `    }\n\n`;

  // Update
  classContent += `    /**\n`;
  classContent += `     * Update a ${className}\n`;
  classContent += `     * @param {Partial<${className}>} data\n`;
  classContent += `     * @returns {${className} | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async update(data) {\n`;
  classContent += `    ${updateValidator}\n\n`;
  classContent += `        const { error } = ${className}Validator.validate(data);\n`;
  classContent += `        if (error) {\n`;
  classContent += `            return { message: error.message };\n`;
  classContent += `        }\n\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'UPDATE ${
    schema.tableName
  } SET ${schema.columns
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (b.name < a.name) {
        return 1;
      }
      return 0;
    })
    .filter((column) => {
      return column.name !== 'id';
    })
    .map((column, index) => `${column.name} = $${index + 1}`)
    .join(', ')} WHERE id = $${schema.columns.length} RETURNING *',\n`;
  classContent += `            values: [${schema.columns
    .filter((column) => {
      return column.name !== 'id';
    })
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (b.name < a.name) {
        return 1;
      }
      return 0;
    })
    .map((column) => `data.${column.name} || ${typeToValue(column.type)}`)
    .join(', ')}, data.id]\n`;
  classContent += `        };\n`;
  classContent += `        const result = await dbQuery(query);\n`;
  classContent += `        if (!result) {\n`;
  classContent += `            return { message: 'Could not update ${className}' };\n`;
  classContent += `        }\n`;
  classContent += `        return result[0];\n`;
  classContent += `    }\n\n`;

  // Delete
  classContent += `    /**\n`;
  classContent += `     * Delete a ${className}\n`;
  classContent += `     * @param {number} id\n`;
  classContent += `     * @returns {${className} | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async delete(id) {\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'DELETE FROM ${schema.tableName} WHERE id = $1 RETURNING *',\n`;
  classContent += `            values: [id]\n`;
  classContent += `        };\n`;
  classContent += `        const result = await dbQuery(query);\n`;
  classContent += `        if (!result) {\n`;
  classContent += `            return { message: 'Could not delete ${className}' };\n`;
  classContent += `        }\n`;
  classContent += `        return result[0];\n`;
  classContent += `    }\n\n`;

  classContent += `}\n\n`;

  classContent += `module.exports = { ${className} };`;

  fs.writeFileSync(`${path}/${className}.js`, classContent);
}

export const generateJavascriptServer = (schemaFile: Schema, path: string) => {
  const keys = Object.keys(schemaFile);

  for (const key of keys) {
    const table = schemaFile[key];
    const columns = table.map((column: Spec) => ({
      name: column.column_name,
      type: column.data_type,
      isNullable: column.is_nullable,
      isForeignKey: column.is_foreign_key,
      referencedTable: column.referenced_table_name,
    }));

    generateJavascriptClass(
      {
        tableName: key,
        columns,
      },
      path,
    );

    generateDbFile(path, 'js');
  }
};

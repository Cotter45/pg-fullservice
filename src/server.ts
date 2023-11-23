import fs from 'fs';

import { convertDBTypeToTsType, snakeToPascal, typeToValue } from './util';

import type { MappedSpec, Schema, Spec } from './types';

function generateTypescriptClass(
  schema: {
    tableName: string;
    columns: MappedSpec[];
  },
  path: string,
) {
  const className = snakeToPascal(schema.tableName);

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
          column.name !== 'created_at' &&
          column.name !== 'updated_at'
        );
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
  classContent += `import { Client } from 'pg';\n\n`;

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

  // Static

  // Connect DB
  classContent += `    /**\n`;
  classContent += `     * Connect to the database\n`;
  classContent += `     * @returns {Client}\n`;
  classContent += `     */\n`;

  classContent += `    private static connectDB() {\n`;
  classContent += `        return new Client({\n`;
  classContent += `            connectionString: process.env.DATABASE_URL,\n`;
  classContent += `        });\n`;
  classContent += `    }\n\n`;

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
  classContent += `        const client = this.connectDB();\n`;
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
  classContent += `        try {\n`;
  classContent += `        await client.connect();\n`;
  classContent += `        const result = await client.query(query);\n`;
  classContent += `        return result.rows[0];\n`;
  classContent += `        } catch (error: any) {\n`;
  classContent += `            return { message: error.message };\n`;
  classContent += `        } finally {\n`;
  classContent += `            await client.end();\n`;
  classContent += `        }\n`;
  classContent += `    }\n\n`;

  // Read
  classContent += `    /**\n`;
  classContent += `     * Read a ${className}\n`;
  classContent += `     * @param {number} id\n`;
  classContent += `     * @returns {${className} | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async read(id: number): Promise<${className} | { message: string }> {\n`;
  classContent += `        const client = this.connectDB();\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'SELECT * FROM ${schema.tableName} WHERE id = $1',\n`;
  classContent += `            values: [id]\n`;
  classContent += `        };\n`;
  classContent += `        try {\n`;
  classContent += `        await client.connect();\n`;
  classContent += `        const result = await client.query(query);\n`;
  classContent += `        return result.rows[0]\n`;
  classContent += `        } catch (error: any) {\n`;
  classContent += `            return { message: error.message };\n`;
  classContent += `        } finally {\n`;
  classContent += `            await client.end();\n`;
  classContent += `        }\n`;
  classContent += `    }\n\n`;

  // Paginate
  classContent += `    /**\n`;
  classContent += `     * Paginate ${className}s\n`;
  classContent += `     * @param {number} page\n`;
  classContent += `     * @param {number} limit\n`;
  classContent += `     * @returns {${className}[] | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async paginate(page: number, limit: number): Promise<${className}[] | { message: string }> {\n`;
  classContent += `        const client = this.connectDB();\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'SELECT * FROM ${schema.tableName} ORDER BY id DESC LIMIT $1 OFFSET $2',\n`;
  classContent += `            values: [limit, (page - 1) * limit]\n`;
  classContent += `        };\n`;
  classContent += `        try {\n`;
  classContent += `        await client.connect();\n`;
  classContent += `        const result = await client.query(query);\n`;
  classContent += `        return result.rows\n`;
  classContent += `        } catch (error: any) {\n`;
  classContent += `            return { message: error.message };\n`;
  classContent += `        } finally {\n`;
  classContent += `            await client.end();\n`;
  classContent += `        }\n`;
  classContent += `    }\n\n`;

  // Get Many
  classContent += `    /**\n`;
  classContent += `     * Get many ${className}s\n`;
  classContent += `     * @param {number[]} ids\n`;
  classContent += `     * @returns {${className}[] | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async getMany(ids: number[]): Promise<${className}[] | { message: string }> {\n`;
  classContent += `        const client = this.connectDB();\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'SELECT * FROM ${schema.tableName} WHERE id = ANY($1)',\n`;
  classContent += `            values: [ids]\n`;
  classContent += `        };\n`;
  classContent += `        try {\n`;
  classContent += `        await client.connect();\n`;
  classContent += `        const result = await client.query(query);\n`;
  classContent += `        return result.rows\n`;
  classContent += `        } catch (error: any) {\n`;
  classContent += `            return { message: error.message };\n`;
  classContent += `        } finally {\n`;
  classContent += `            await client.end();\n`;
  classContent += `        }\n`;
  classContent += `    }\n\n`;

  // Get All
  classContent += `    /**\n`;
  classContent += `     * Get all ${className}s\n`;
  classContent += `     * @returns {${className}[] | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async getAll(): Promise<${className}[] | { message: string }> {\n`;
  classContent += `        const client = this.connectDB();\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'SELECT * FROM ${schema.tableName} ORDER BY id DESC',\n`;
  classContent += `            values: []\n`;
  classContent += `        };\n`;
  classContent += `        try {\n`;
  classContent += `        await client.connect();\n`;
  classContent += `        const result = await client.query(query);\n`;
  classContent += `        return result.rows\n`;
  classContent += `        } catch (error: any) {\n`;
  classContent += `            return { message: error.message };\n`;
  classContent += `        } finally {\n`;
  classContent += `            await client.end();\n`;
  classContent += `        }\n`;
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
  classContent += `        const client = this.connectDB();\n`;
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
  classContent += `        try {\n`;
  classContent += `        await client.connect();\n`;
  classContent += `        const result = await client.query(query);\n`;
  classContent += `        return result.rows[0]\n`;
  classContent += `        } catch (error: any) {\n`;
  classContent += `            return { message: error.message };\n`;
  classContent += `        } finally {\n`;
  classContent += `            await client.end();\n`;
  classContent += `        }\n`;
  classContent += `    }\n\n`;

  // Delete
  classContent += `    /**\n`;
  classContent += `     * Delete a ${className}\n`;
  classContent += `     * @param {number} id\n`;
  classContent += `     * @returns {${className} | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async delete(id: number): Promise<${className} | { message: string }> {\n`;
  classContent += `        const client = this.connectDB();\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'DELETE FROM ${schema.tableName} WHERE id = $1 RETURNING *',\n`;
  classContent += `            values: [id]\n`;
  classContent += `        };\n`;
  classContent += `        try {\n`;
  classContent += `        await client.connect();\n`;
  classContent += `        const result = await client.query(query);\n`;
  classContent += `        return result.rows[0]\n`;
  classContent += `        } catch (error: any) {\n`;
  classContent += `            return { message: error.message };\n`;
  classContent += `        } finally {\n`;
  classContent += `            await client.end();\n`;
  classContent += `        }\n`;
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
  }
};

function generateJavascriptClass(
  schema: {
    tableName: string;
    columns: MappedSpec[];
  },
  path: string,
) {
  const className = snakeToPascal(schema.tableName);

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
          column.name !== 'created_at' &&
          column.name !== 'updated_at'
        );
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
  classContent += `const { Client } = require('pg');\n\n`;

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

  // Static

  // Connect DB
  classContent += `    /**\n`;
  classContent += `     * Connect to the database\n`;
  classContent += `     * @returns {Client}\n`;
  classContent += `     */\n`;

  classContent += `    static connectDB() {\n`;
  classContent += `        return new Client({\n`;
  classContent += `            connectionString: process.env.DATABASE_URL,\n`;
  classContent += `        });\n`;
  classContent += `    }\n\n`;

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
  classContent += `        const client = this.connectDB();\n`;
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
  classContent += `        try {\n`;
  classContent += `        await client.connect();\n`;
  classContent += `        const result = await client.query(query);\n`;
  classContent += `        return result.rows[0];\n`;
  classContent += `        } catch (error) {\n`;
  classContent += `            return { message: error.message };\n`;
  classContent += `        } finally {\n`;
  classContent += `            await client.end();\n`;
  classContent += `        }\n`;
  classContent += `    }\n\n`;

  // Read
  classContent += `    /**\n`;
  classContent += `     * Read a ${className}\n`;
  classContent += `     * @param {number} id\n`;
  classContent += `     * @returns {${className} | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async read(id) {\n`;
  classContent += `        const client = this.connectDB();\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'SELECT * FROM ${schema.tableName} WHERE id = $1',\n`;
  classContent += `            values: [id]\n`;
  classContent += `        };\n`;
  classContent += `        try {\n`;
  classContent += `        await client.connect();\n`;
  classContent += `        const result = await client.query(query);\n`;
  classContent += `        return result.rows[0]\n`;
  classContent += `        } catch (error) {\n`;
  classContent += `            return { message: error.message };\n`;
  classContent += `        } finally {\n`;
  classContent += `            await client.end();\n`;
  classContent += `        }\n`;
  classContent += `    }\n\n`;

  // Paginate
  classContent += `    /**\n`;
  classContent += `     * Paginate ${className}s\n`;
  classContent += `     * @param {number} page\n`;
  classContent += `     * @param {number} limit\n`;
  classContent += `     * @returns {${className}[] | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async paginate(page, limit) {\n`;
  classContent += `        const client = this.connectDB();\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'SELECT * FROM ${schema.tableName} ORDER BY id DESC LIMIT $1 OFFSET $2',\n`;
  classContent += `            values: [limit, (page - 1) * limit]\n`;
  classContent += `        };\n`;
  classContent += `        try {\n`;
  classContent += `        await client.connect();\n`;
  classContent += `        const result = await client.query(query);\n`;
  classContent += `        return result.rows\n`;
  classContent += `        } catch (error) {\n`;
  classContent += `            return { message: error.message };\n`;
  classContent += `        } finally {\n`;
  classContent += `            await client.end();\n`;
  classContent += `        }\n`;
  classContent += `    }\n\n`;

  // Get Many
  classContent += `    /**\n`;
  classContent += `     * Get many ${className}s\n`;
  classContent += `     * @param {number[]} ids\n`;
  classContent += `     * @returns {${className}[] | { message: string }}\n`;

  classContent += `    static async getMany(ids) {\n`;
  classContent += `        const client = this.connectDB();\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'SELECT * FROM ${schema.tableName} WHERE id = ANY($1)',\n`;
  classContent += `            values: [ids]\n`;
  classContent += `        };\n`;
  classContent += `        try {\n`;
  classContent += `        await client.connect();\n`;
  classContent += `        const result = await client.query(query);\n`;
  classContent += `        return result.rows\n`;
  classContent += `        } catch (error) {\n`;
  classContent += `            return { message: error.message };\n`;
  classContent += `        } finally {\n`;
  classContent += `            await client.end();\n`;
  classContent += `        }\n`;
  classContent += `    }\n\n`;

  // Get All
  classContent += `    /**\n`;
  classContent += `     * Get all ${className}s\n`;
  classContent += `     * @returns {${className}[] | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async getAll() {\n`;
  classContent += `        const client = this.connectDB();\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'SELECT * FROM ${schema.tableName} ORDER BY id DESC',\n`;
  classContent += `            values: []\n`;
  classContent += `        };\n`;
  classContent += `        try {\n`;
  classContent += `        await client.connect();\n`;
  classContent += `        const result = await client.query(query);\n`;
  classContent += `        return result.rows\n`;
  classContent += `        } catch (error) {\n`;
  classContent += `            return { message: error.message };\n`;
  classContent += `        } finally {\n`;
  classContent += `            await client.end();\n`;
  classContent += `        }\n`;
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
  classContent += `        const client = this.connectDB();\n`;
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
  classContent += `        try {\n`;
  classContent += `        await client.connect();\n`;
  classContent += `        const result = await client.query(query);\n`;
  classContent += `        return result.rows[0]\n`;
  classContent += `        } catch (error) {\n`;
  classContent += `            return { message: error.message };\n`;
  classContent += `        } finally {\n`;
  classContent += `            await client.end();\n`;
  classContent += `        }\n`;
  classContent += `    }\n\n`;

  // Delete
  classContent += `    /**\n`;
  classContent += `     * Delete a ${className}\n`;
  classContent += `     * @param {number} id\n`;
  classContent += `     * @returns {${className} | { message: string }}\n`;
  classContent += `     */\n`;

  classContent += `    static async delete(id) {\n`;
  classContent += `        const client = this.connectDB();\n`;
  classContent += `        const query = {\n`;
  classContent += `            text: 'DELETE FROM ${schema.tableName} WHERE id = $1 RETURNING *',\n`;
  classContent += `            values: [id]\n`;
  classContent += `        };\n`;
  classContent += `        try {\n`;
  classContent += `        await client.connect();\n`;
  classContent += `        const result = await client.query(query);\n`;
  classContent += `        return result.rows[0]\n`;
  classContent += `        } catch (error) {\n`;
  classContent += `            return { message: error.message };\n`;
  classContent += `        } finally {\n`;
  classContent += `            await client.end();\n`;
  classContent += `        }\n`;
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
  }
};

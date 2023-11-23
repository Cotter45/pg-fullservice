import fs from 'fs';

import { convertDBTypeToTsType, snakeToPascal } from './util';

import type { Schema, MappedSpec, Spec } from './types';

function generateTypescriptClass(
  schema: {
    tableName: string;
    columns: MappedSpec[];
  },
  path: string,
) {
  const className = snakeToPascal(schema.tableName);

  let classContent = `class ${className} {\n`;

  // Properties
  schema.columns.forEach((column) => {
    classContent += `    declare ${column.name}: ${convertDBTypeToTsType(
      column.type,
    )};\n`;
  });

  classContent += `\n    constructor(init?: Partial<${className}>) {\n`;
  classContent += `        Object.assign(this, init);\n    }\n\n`;

  // Static

  classContent += `};`;

  fs.writeFileSync(`${path}/${className}.ts`, classContent);
}

export const generateTypescriptClient = (schemaFile: Schema, path: string) => {
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

  let classContent = `class ${className} {\n`;

  // Properties
  schema.columns.forEach((column) => {
    classContent += `    ${column.name};\n`;
  });

  classContent += `\n    constructor(init) {\n`;
  classContent += `        Object.assign(this, init);\n    }\n\n`;

  // Static

  classContent += `};`;

  fs.writeFileSync(`${path}/${className}.js`, classContent);
}

export const generateJavascriptClient = (schemaFile: Schema, path: string) => {
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

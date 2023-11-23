import fs from 'fs';
import path from 'path';
const inquirer = require('inquirer');

import type { Schema } from './types';
import { getAllTables } from './getAllTables';
import Joi from 'joi';
import { generateJavascriptServer, generateTypescriptServer } from './server';
import { generateJavascriptClient, generateTypescriptClient } from './client';

export const generator = async () => {
  let schemaPath = '';
  let connectionString = '';
  let schema: Schema = {};

  try {
    const answerHow = await inquirer.prompt([
      {
        type: 'list',
        name: 'schemaType',
        message: 'How would you like to provide the schema?',
        choices: ['Schema file', 'PostgreSQL connection string'],
      },
    ]);

    if (answerHow.schemaType === 'Schema file') {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'schemaPath',
          message: 'Enter the relative path to the schema file:',
        },
      ]);

      // check if schema file exists, relative to the package.json file
      schemaPath = path.join(process.cwd(), answer.schemaPath);

      if (!fs.existsSync(schemaPath)) {
        throw new Error('Schema file does not exist');
      }

      // read schema file
      const schemaFile = fs.readFileSync(schemaPath, 'utf-8');
      schema = JSON.parse(schemaFile);
    } else {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'connectionString',
          message: 'Enter the PostgreSQL connection string:',
        },
      ]);

      // check if connection string is valid
      connectionString = answer.connectionString;

      // get schema from database
      const result = await getAllTables(connectionString);

      if (!result) {
        throw new Error('Invalid connection string');
      }

      schema = result;
    }

    // should validate Schema type
    const validator = Joi.object().pattern(
      Joi.string(),
      Joi.array().items(
        Joi.object({
          column_name: Joi.string(),
          data_type: Joi.string(),
          is_nullable: Joi.string().valid('YES', 'NO'),
          is_foreign_key: Joi.boolean(),
          referenced_table_name: Joi.string().allow(null),
        }),
      ),
    );

    const { error } = validator.validate(schema);

    if (error) {
      throw new Error(error.message);
    }

    // answer what eg 'All' or checkbox of the tables
    const tableNames = Object.keys(schema);

    const answerWhat = await inquirer.prompt([
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
      const filteredSchema: Schema = {};

      for (const table of tables) {
        filteredSchema[table] = schema[table];
      }

      schema = filteredSchema;
    }

    // list options set 2 = ['server', 'client', 'both']
    const answer2 = await inquirer.prompt([
      {
        type: 'list',
        name: 'outputType',
        message: 'What would you like to generate?',
        choices: ['Server Code (Full)', 'Client Code (Scaffold)', 'Both'],
      },
    ]);

    const outpuType = answer2.outputType.toLowerCase();

    // prompt for output dir
    const answer3 = await inquirer.prompt([
      {
        type: 'input',
        name: 'outputDir',
        message: 'Enter the relative path to the output directory:',
        default: `${process.cwd()}/services`,
      },
    ]);

    // check if output dir exists
    const outputDir =
      answer3.outputDir === `${process.cwd()}/services`
        ? answer3.outputDir
        : path.join(process.cwd(), answer3.outputDir || 'services');

    if (!fs.existsSync(outputDir)) {
      if (!fs.existsSync(path.join(process.cwd(), 'services'))) {
        fs.mkdirSync(path.join(process.cwd(), 'services'));
      } else {
        throw new Error('Output directory does not exist');
      }
    }

    // list options set 3 = ['typescript', 'javascript']
    const answer4 = await inquirer.prompt([
      {
        type: 'list',
        name: 'language',
        message: 'What language would you like to generate?',
        choices: ['Typescript', 'Javascript'],
      },
    ]);

    const language = answer4.language.toLowerCase();
    const folderPath = path.join(outputDir, 'server');
    const clientPath = path.join(outputDir, 'client');

    if (language === 'typescript') {
      // SERVER ONLY
      if (outpuType === 'server code (full)') {
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath);
        }

        generateTypescriptServer(schema, folderPath);
        // CLIENT ONLY
      } else if (outpuType === 'client code (scaffold)') {
        if (!fs.existsSync(clientPath)) {
          fs.mkdirSync(clientPath);
        }
        generateTypescriptClient(schema, clientPath);
        // BOTH
      } else {
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath);
        }

        if (!fs.existsSync(clientPath)) {
          fs.mkdirSync(clientPath);
        }

        generateTypescriptServer(schema, folderPath);
        generateTypescriptClient(schema, clientPath);
      }
    } else {
      // SERVER ONLY JAVASCRIPT
      if (outpuType === 'server code (full)') {
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath);
        }

        generateJavascriptServer(schema, folderPath);
        // CLIENT ONLY JAVASCRIPT
      } else if (outpuType === 'client code (scaffold)') {
        if (!fs.existsSync(clientPath)) {
          fs.mkdirSync(clientPath);
        }

        generateJavascriptClient(schema, clientPath);
        // BOTH JAVASCRIPT
      } else {
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath);
        }

        if (!fs.existsSync(clientPath)) {
          fs.mkdirSync(clientPath);
        }

        generateJavascriptServer(schema, folderPath);
        generateJavascriptClient(schema, clientPath);
      }
    }

    // write schema to file in output dir
    fs.writeFileSync(
      path.join(outputDir, 'schema.json'),
      JSON.stringify(schema),
    );
  } catch (error: any) {
    console.log(error);
  }
};

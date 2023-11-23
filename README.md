# @cotter45/pg-fullservice

## Description

`@cotter45/pg-fullservice` is a full-service PostgreSQL server and client code generator for Typescript, Javascript, and Node.JS. It generates query models for projects using Joi and PostgreSQL queries instead of an ORM. It can generate files in TypeScript or JavaScript for the client or API and is framework agnostic.

**NOTE:** This is not a full ORM. It is a code generator for PostgreSQL queries and Joi validation models, simply meant to save time writing boilerplate code especially in Typescript projects.

## Installation

You can use `npx` to run this package without installing it:

```bash
npx @cotter45/pg-fullservice
```

## Usage

This is a command-line application that will prompt for a schema file or PostgreSQL connection string, connect to the database, and generate files based on the selections for the output directory and the type (ts | js).

The program will first prompt for a schema file or a postgres connection string. The format of the schema file is as follows:

```json
{
  "table_name: [
    {
      "column_name": "string",
      "data_type": "PostgreSQL data type",
      "is_nullable": "YES | NO",
      "is_foreign_key": "boolean (true | false)",
      "referenced_table_name": "string | null",
    }
  ]
}
```

If you choose to use a connection string, the program will connect to the database and generate the schema file for you.

## Dependencies

This project depends on the inquirer npm package to run and has peer dependencies of joi and pg for the generated code.

- [joi](https://www.npmjs.com/package/joi)
- [pg](https://www.npmjs.com/package/pg)

## Contact

For any issues, please visit the [GitHub repository](https://github.com/Cotter45/pg-fullservice/issues).

## License

This project is licensed under the MIT License.

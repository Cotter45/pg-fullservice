# @cotter45/pg-fullservice

## Description

`@cotter45/pg-fullservice` is a full-service PostgreSQL server and client code generator for Typescript, Javascript, and Node.JS. It generates query models for projects using Joi and PostgreSQL queries instead of an ORM. It can generate files in TypeScript or JavaScript for the client or API and is framework agnostic.

## Installation

You can use `npx` to run this package without installing it:

```bash
npx @cotter45/pg-fullservice
```

## Usage

This is a command-line application that will prompt for a schema file or PostgreSQL connection string, connect to the database, and generate files based on the selections for the output directory and the type (ts | js).

## Dependencies

This project depends on the inquirer npm package and has peer dependencies of joi and pg.

- [inquirer](https://www.npmjs.com/package/inquirer)
- [joi](https://www.npmjs.com/package/joi)
- [pg](https://www.npmjs.com/package/pg)

## Contact

For any issues, please visit the [GitHub repository](https://github.com/Cotter45/pg-fullservice/issues).

## License

This project is licensed under the MIT License.

import { Client } from 'pg';

import { getTable } from './getTable';

import type { Schema } from './types';

export const getAllTables = async (connectionString: string) => {
  const client = new Client({
    connectionString,
  });
  await client.connect();

  try {
    const query = {
      text: `
        SELECT
          table_name
        FROM INFORMATION_SCHEMA.TABLES
        WHERE table_schema = 'public';
      `,
    };

    const result = await client.query<{ table_name: string }>(query);

    const tables = result.rows
      ? result.rows
          .map((row) => row.table_name)
          .filter((tn) => tn !== 'migrations')
      : [];

    if (tables.length > 0) {
      const tableData: Schema = {};

      for (const tableName of tables) {
        const table = await getTable(client, tableName);

        if (!table) {
          continue;
        }

        tableData[tableName] = table;
      }

      return tableData;
    }
  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
};

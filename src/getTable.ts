import type { Client } from 'pg';
import type { Spec } from './types';

export const getTable = async (client: Client, tableName: string) => {
  try {
    const query = {
      text: `
        SELECT
          c.column_name,
          c.data_type,
          c.is_nullable,
          CASE WHEN kcu.column_name IS NOT NULL THEN true ELSE false END AS is_foreign_key,
          refc.referenced_table_name
        FROM 
          INFORMATION_SCHEMA.COLUMNS c
        LEFT JOIN 
          INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu ON c.column_name = kcu.column_name AND c.table_name = kcu.table_name
        LEFT JOIN 
          (SELECT 
            kcu1.table_name,
            kcu1.column_name,
            kcu2.table_name AS referenced_table_name
          FROM 
            information_schema.referential_constraints rc
          JOIN 
            information_schema.key_column_usage kcu1 ON rc.constraint_name = kcu1.constraint_name
          JOIN 
            information_schema.key_column_usage kcu2 ON rc.unique_constraint_name = kcu2.constraint_name
          WHERE 
            kcu1.table_schema = 'public' AND kcu2.table_schema = 'public') refc ON c.column_name = refc.column_name AND c.table_name = refc.table_name
        WHERE 
          c.table_name = $1;
      `,
      values: [tableName],
    };

    const result = await client.query<Spec>(query);
    return result.rows;
  } catch (error) {
    console.error(error);
  }
};

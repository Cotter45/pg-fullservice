import type { Schema } from './types';
export declare const getAllTables: (connectionString: string) => Promise<Schema | undefined>;

import type { Client } from 'pg';
import type { Spec } from './types';
export declare const getTable: (client: Client, tableName: string) => Promise<Spec[] | undefined>;

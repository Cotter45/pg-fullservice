import Joi from 'joi';
import { Client } from 'pg';

/**
 * Subtasks Model
 */
class Subtasks {
    declare created_at: Date;
    declare id: number;
    declare position: number;
    declare status: string;
    declare task_id: number;
    declare title: string;
    declare user_id: number;

    /**
     * Create a new Subtasks
     * @param {Partial<Subtasks>} data
     * @returns {Subtasks | { message: string }}
     */

    constructor(init?: Partial<Subtasks>) {
        Object.assign(this, init);
    }

    /**
     * Connect to the database
     * @returns {Client}
     */
    private static connectDB() {
        return new Client({
            connectionString: process.env.DATABASE_URL,
        });
    }

    /**
     * Create a new Subtasks
     * @param {Partial<Subtasks>} data
     * @returns {Subtasks | { message: string }}
     */
    static async create(data: Partial<Subtasks>): Promise<Subtasks | { message: string }> {
    const SubtasksValidator = Joi.object({
    position: Joi.number().allow(null).allow(''),
    status: Joi.string().allow(null).allow(''),
    task_id: Joi.number().allow(null).allow(''),
    title: Joi.string().allow(null).allow(''),
    user_id: Joi.number().allow(null).allow('')
});

        const { error } = SubtasksValidator.validate(data);
        if (error) {
            return { message: error.message };
        }

        const client = this.connectDB();
        const query = {
            text: 'INSERT INTO subtasks(created_at, position, status, task_id, title, user_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
            values: [data.created_at || new Date(), data.position || 0, data.status || '', data.task_id || 0, data.title || '', data.user_id || 0]
        };
        try {
        await client.connect();
        const result = await client.query(query);
        return result.rows[0];
        } catch (error: any) {
            return { message: error.message };
        } finally {
            await client.end();
        }
    }

    /**
     * Read a Subtasks
     * @param {number} id
     * @returns {Subtasks | { message: string }}
     */
    static async read(id: number): Promise<Subtasks | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM subtasks WHERE id = $1',
            values: [id]
        };
        try {
        await client.connect();
        const result = await client.query(query);
        return result.rows[0]
        } catch (error: any) {
            return { message: error.message };
        } finally {
            await client.end();
        }
    }

    /**
     * Paginate Subtaskss
     * @param {number} page
     * @param {number} limit
     * @returns {Subtasks[] | { message: string }}
     */
    static async paginate(page: number, limit: number): Promise<Subtasks[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM subtasks ORDER BY id DESC LIMIT $1 OFFSET $2',
            values: [limit, (page - 1) * limit]
        };
        try {
        await client.connect();
        const result = await client.query(query);
        return result.rows
        } catch (error: any) {
            return { message: error.message };
        } finally {
            await client.end();
        }
    }

    /**
     * Get many Subtaskss
     * @param {number[]} ids
     * @returns {Subtasks[] | { message: string }}
     */
    static async getMany(ids: number[]): Promise<Subtasks[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM subtasks WHERE id = ANY($1)',
            values: [ids]
        };
        try {
        await client.connect();
        const result = await client.query(query);
        return result.rows
        } catch (error: any) {
            return { message: error.message };
        } finally {
            await client.end();
        }
    }

    /**
     * Get all Subtaskss
     * @returns {Subtasks[] | { message: string }}
     */
    static async getAll(): Promise<Subtasks[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM subtasks ORDER BY id DESC',
            values: []
        };
        try {
        await client.connect();
        const result = await client.query(query);
        return result.rows
        } catch (error: any) {
            return { message: error.message };
        } finally {
            await client.end();
        }
    }

    /**
     * Update a Subtasks
     * @param {Partial<Subtasks>} data
     * @returns {Subtasks | { message: string }}
     */
    static async update(data: Partial<Subtasks>): Promise<Subtasks | { message: string }> {
    const SubtasksValidator = Joi.object({
    created_at: Joi.date().allow(null).allow(''),
    id: Joi.number().allow(null).allow(''),
    position: Joi.number().allow(null).allow(''),
    status: Joi.string().allow(null).allow(''),
    task_id: Joi.number().allow(null).allow(''),
    title: Joi.string().allow(null).allow(''),
    user_id: Joi.number().allow(null).allow('')
});

        const { error } = SubtasksValidator.validate(data);
        if (error) {
            return { message: error.message };
        }

        const client = this.connectDB();
        const query = {
            text: 'UPDATE subtasks SET created_at = $1, position = $2, status = $3, task_id = $4, title = $5, user_id = $6 WHERE id = $7 RETURNING *',
            values: [data.created_at || new Date(), data.position || 0, data.status || '', data.task_id || 0, data.title || '', data.user_id || 0, data.id]
        };
        try {
        await client.connect();
        const result = await client.query(query);
        return result.rows[0]
        } catch (error: any) {
            return { message: error.message };
        } finally {
            await client.end();
        }
    }

    /**
     * Delete a Subtasks
     * @param {number} id
     * @returns {Subtasks | { message: string }}
     */
    static async delete(id: number): Promise<Subtasks | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'DELETE FROM subtasks WHERE id = $1 RETURNING *',
            values: [id]
        };
        try {
        await client.connect();
        const result = await client.query(query);
        return result.rows[0]
        } catch (error: any) {
            return { message: error.message };
        } finally {
            await client.end();
        }
    }

}

export default Subtasks;
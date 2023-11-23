import Joi from 'joi';
import { Client } from 'pg';

/**
 * Reminders Model
 */
class Reminders {
    declare created_at: Date;
    declare email: string;
    declare id: number;
    declare interval: string;
    declare message: string;
    declare task_id: number;
    declare time: Date;
    declare type: string;
    declare updated_at: Date;
    declare user_id: number;

    /**
     * Create a new Reminders
     * @param {Partial<Reminders>} data
     * @returns {Reminders | { message: string }}
     */

    constructor(init?: Partial<Reminders>) {
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
     * Create a new Reminders
     * @param {Partial<Reminders>} data
     * @returns {Reminders | { message: string }}
     */
    static async create(data: Partial<Reminders>): Promise<Reminders | { message: string }> {
    const RemindersValidator = Joi.object({
    email: Joi.string().allow(null).allow(''),
    interval: Joi.string().allow(null).allow(''),
    message: Joi.string().allow(null).allow(''),
    task_id: Joi.number().allow(null).allow(''),
    time: Joi.date().allow(null).allow(''),
    type: Joi.string().allow(null).allow(''),
    user_id: Joi.number().allow(null).allow('')
});

        const { error } = RemindersValidator.validate(data);
        if (error) {
            return { message: error.message };
        }

        const client = this.connectDB();
        const query = {
            text: 'INSERT INTO reminders(created_at, email, interval, message, task_id, time, type, updated_at, user_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            values: [data.created_at || new Date(), data.email || '', data.interval || '', data.message || '', data.task_id || 0, data.time || new Date(), data.type || '', data.updated_at || new Date(), data.user_id || 0]
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
     * Read a Reminders
     * @param {number} id
     * @returns {Reminders | { message: string }}
     */
    static async read(id: number): Promise<Reminders | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM reminders WHERE id = $1',
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
     * Paginate Reminderss
     * @param {number} page
     * @param {number} limit
     * @returns {Reminders[] | { message: string }}
     */
    static async paginate(page: number, limit: number): Promise<Reminders[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM reminders ORDER BY id DESC LIMIT $1 OFFSET $2',
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
     * Get many Reminderss
     * @param {number[]} ids
     * @returns {Reminders[] | { message: string }}
     */
    static async getMany(ids: number[]): Promise<Reminders[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM reminders WHERE id = ANY($1)',
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
     * Get all Reminderss
     * @returns {Reminders[] | { message: string }}
     */
    static async getAll(): Promise<Reminders[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM reminders ORDER BY id DESC',
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
     * Update a Reminders
     * @param {Partial<Reminders>} data
     * @returns {Reminders | { message: string }}
     */
    static async update(data: Partial<Reminders>): Promise<Reminders | { message: string }> {
    const RemindersValidator = Joi.object({
    created_at: Joi.date().allow(null).allow(''),
    email: Joi.string().allow(null).allow(''),
    id: Joi.number().allow(null).allow(''),
    interval: Joi.string().allow(null).allow(''),
    message: Joi.string().allow(null).allow(''),
    task_id: Joi.number().allow(null).allow(''),
    time: Joi.date().allow(null).allow(''),
    type: Joi.string().allow(null).allow(''),
    updated_at: Joi.date().allow(null).allow(''),
    user_id: Joi.number().allow(null).allow('')
});

        const { error } = RemindersValidator.validate(data);
        if (error) {
            return { message: error.message };
        }

        const client = this.connectDB();
        const query = {
            text: 'UPDATE reminders SET created_at = $1, email = $2, interval = $3, message = $4, task_id = $5, time = $6, type = $7, updated_at = $8, user_id = $9 WHERE id = $10 RETURNING *',
            values: [data.created_at || new Date(), data.email || '', data.interval || '', data.message || '', data.task_id || 0, data.time || new Date(), data.type || '', data.updated_at || new Date(), data.user_id || 0, data.id]
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
     * Delete a Reminders
     * @param {number} id
     * @returns {Reminders | { message: string }}
     */
    static async delete(id: number): Promise<Reminders | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'DELETE FROM reminders WHERE id = $1 RETURNING *',
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

export default Reminders;
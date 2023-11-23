import Joi from 'joi';
import { Client } from 'pg';

/**
 * Goals Model
 */
class Goals {
    declare ai_summary: string;
    declare created_at: Date;
    declare description: string;
    declare focus_id: number;
    declare id: number;
    declare priority: number;
    declare status: string;
    declare title: string;
    declare updated_at: Date;
    declare user_id: number;

    /**
     * Create a new Goals
     * @param {Partial<Goals>} data
     * @returns {Goals | { message: string }}
     */

    constructor(init?: Partial<Goals>) {
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
     * Create a new Goals
     * @param {Partial<Goals>} data
     * @returns {Goals | { message: string }}
     */
    static async create(data: Partial<Goals>): Promise<Goals | { message: string }> {
    const GoalsValidator = Joi.object({
    ai_summary: Joi.string().allow(null).allow(''),
    description: Joi.string().allow(null).allow(''),
    focus_id: Joi.number().allow(null).allow(''),
    priority: Joi.number().allow(null).allow(''),
    status: Joi.string().allow(null).allow(''),
    title: Joi.string().allow(null).allow(''),
    user_id: Joi.number().allow(null).allow('')
});

        const { error } = GoalsValidator.validate(data);
        if (error) {
            return { message: error.message };
        }

        const client = this.connectDB();
        const query = {
            text: 'INSERT INTO goals(ai_summary, created_at, description, focus_id, priority, status, title, updated_at, user_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            values: [data.ai_summary || '', data.created_at || new Date(), data.description || '', data.focus_id || 0, data.priority || 0, data.status || '', data.title || '', data.updated_at || new Date(), data.user_id || 0]
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
     * Read a Goals
     * @param {number} id
     * @returns {Goals | { message: string }}
     */
    static async read(id: number): Promise<Goals | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM goals WHERE id = $1',
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
     * Paginate Goalss
     * @param {number} page
     * @param {number} limit
     * @returns {Goals[] | { message: string }}
     */
    static async paginate(page: number, limit: number): Promise<Goals[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM goals ORDER BY id DESC LIMIT $1 OFFSET $2',
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
     * Get many Goalss
     * @param {number[]} ids
     * @returns {Goals[] | { message: string }}
     */
    static async getMany(ids: number[]): Promise<Goals[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM goals WHERE id = ANY($1)',
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
     * Get all Goalss
     * @returns {Goals[] | { message: string }}
     */
    static async getAll(): Promise<Goals[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM goals ORDER BY id DESC',
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
     * Update a Goals
     * @param {Partial<Goals>} data
     * @returns {Goals | { message: string }}
     */
    static async update(data: Partial<Goals>): Promise<Goals | { message: string }> {
    const GoalsValidator = Joi.object({
    ai_summary: Joi.string().allow(null).allow(''),
    created_at: Joi.date().allow(null).allow(''),
    description: Joi.string().allow(null).allow(''),
    focus_id: Joi.number().allow(null).allow(''),
    id: Joi.number().allow(null).allow(''),
    priority: Joi.number().allow(null).allow(''),
    status: Joi.string().allow(null).allow(''),
    title: Joi.string().allow(null).allow(''),
    updated_at: Joi.date().allow(null).allow(''),
    user_id: Joi.number().allow(null).allow('')
});

        const { error } = GoalsValidator.validate(data);
        if (error) {
            return { message: error.message };
        }

        const client = this.connectDB();
        const query = {
            text: 'UPDATE goals SET ai_summary = $1, created_at = $2, description = $3, focus_id = $4, priority = $5, status = $6, title = $7, updated_at = $8, user_id = $9 WHERE id = $10 RETURNING *',
            values: [data.ai_summary || '', data.created_at || new Date(), data.description || '', data.focus_id || 0, data.priority || 0, data.status || '', data.title || '', data.updated_at || new Date(), data.user_id || 0, data.id]
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
     * Delete a Goals
     * @param {number} id
     * @returns {Goals | { message: string }}
     */
    static async delete(id: number): Promise<Goals | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'DELETE FROM goals WHERE id = $1 RETURNING *',
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

export default Goals;
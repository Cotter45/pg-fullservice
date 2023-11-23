import Joi from 'joi';
import { Client } from 'pg';

/**
 * Focus Model
 */
class Focus {
    declare ai_summary: string;
    declare created_at: Date;
    declare description: string;
    declare id: number;
    declare name: string;
    declare status: string;
    declare updated_at: Date;
    declare user_id: number;

    /**
     * Create a new Focus
     * @param {Partial<Focus>} data
     * @returns {Focus | { message: string }}
     */

    constructor(init?: Partial<Focus>) {
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
     * Create a new Focus
     * @param {Partial<Focus>} data
     * @returns {Focus | { message: string }}
     */
    static async create(data: Partial<Focus>): Promise<Focus | { message: string }> {
    const FocusValidator = Joi.object({
    ai_summary: Joi.string().allow(null).allow(''),
    description: Joi.string().allow(null).allow(''),
    name: Joi.string().allow(null).allow(''),
    status: Joi.string().allow(null).allow(''),
    user_id: Joi.number().allow(null).allow('')
});

        const { error } = FocusValidator.validate(data);
        if (error) {
            return { message: error.message };
        }

        const client = this.connectDB();
        const query = {
            text: 'INSERT INTO focus(ai_summary, created_at, description, name, status, updated_at, user_id) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            values: [data.ai_summary || '', data.created_at || new Date(), data.description || '', data.name || '', data.status || '', data.updated_at || new Date(), data.user_id || 0]
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
     * Read a Focus
     * @param {number} id
     * @returns {Focus | { message: string }}
     */
    static async read(id: number): Promise<Focus | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM focus WHERE id = $1',
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
     * Paginate Focuss
     * @param {number} page
     * @param {number} limit
     * @returns {Focus[] | { message: string }}
     */
    static async paginate(page: number, limit: number): Promise<Focus[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM focus ORDER BY id DESC LIMIT $1 OFFSET $2',
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
     * Get many Focuss
     * @param {number[]} ids
     * @returns {Focus[] | { message: string }}
     */
    static async getMany(ids: number[]): Promise<Focus[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM focus WHERE id = ANY($1)',
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
     * Get all Focuss
     * @returns {Focus[] | { message: string }}
     */
    static async getAll(): Promise<Focus[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM focus ORDER BY id DESC',
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
     * Update a Focus
     * @param {Partial<Focus>} data
     * @returns {Focus | { message: string }}
     */
    static async update(data: Partial<Focus>): Promise<Focus | { message: string }> {
    const FocusValidator = Joi.object({
    ai_summary: Joi.string().allow(null).allow(''),
    created_at: Joi.date().allow(null).allow(''),
    description: Joi.string().allow(null).allow(''),
    id: Joi.number().allow(null).allow(''),
    name: Joi.string().allow(null).allow(''),
    status: Joi.string().allow(null).allow(''),
    updated_at: Joi.date().allow(null).allow(''),
    user_id: Joi.number().allow(null).allow('')
});

        const { error } = FocusValidator.validate(data);
        if (error) {
            return { message: error.message };
        }

        const client = this.connectDB();
        const query = {
            text: 'UPDATE focus SET ai_summary = $1, created_at = $2, description = $3, name = $4, status = $5, updated_at = $6, user_id = $7 WHERE id = $8 RETURNING *',
            values: [data.ai_summary || '', data.created_at || new Date(), data.description || '', data.name || '', data.status || '', data.updated_at || new Date(), data.user_id || 0, data.id]
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
     * Delete a Focus
     * @param {number} id
     * @returns {Focus | { message: string }}
     */
    static async delete(id: number): Promise<Focus | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'DELETE FROM focus WHERE id = $1 RETURNING *',
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

export default Focus;
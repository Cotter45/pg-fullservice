import Joi from 'joi';
import { Client } from 'pg';

/**
 * Users Model
 */
class Users {
    declare api_key: string;
    declare created_at: Date;
    declare email: string;
    declare first_name: string;
    declare id: number;
    declare image: string;
    declare last_name: string;
    declare max_tokens_per_request: number;
    declare openai_key: string;
    declare updated_at: Date;
    declare use_ai_for_summaries: boolean;

    /**
     * Create a new Users
     * @param {Partial<Users>} data
     * @returns {Users | { message: string }}
     */

    constructor(init?: Partial<Users>) {
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
     * Create a new Users
     * @param {Partial<Users>} data
     * @returns {Users | { message: string }}
     */
    static async create(data: Partial<Users>): Promise<Users | { message: string }> {
    const UsersValidator = Joi.object({
    api_key: Joi.string().allow(null).allow(''),
    email: Joi.string().allow(null).allow(''),
    first_name: Joi.string().allow(null).allow(''),
    image: Joi.string().allow(null).allow(''),
    last_name: Joi.string().allow(null).allow(''),
    max_tokens_per_request: Joi.number().allow(null).allow(''),
    openai_key: Joi.string().allow(null).allow(''),
    use_ai_for_summaries: Joi.boolean().allow(null).allow('')
});

        const { error } = UsersValidator.validate(data);
        if (error) {
            return { message: error.message };
        }

        const client = this.connectDB();
        const query = {
            text: 'INSERT INTO users(api_key, created_at, email, first_name, image, last_name, max_tokens_per_request, openai_key, updated_at, use_ai_for_summaries) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            values: [data.api_key || '', data.created_at || new Date(), data.email || '', data.first_name || '', data.image || '', data.last_name || '', data.max_tokens_per_request || 0, data.openai_key || '', data.updated_at || new Date(), data.use_ai_for_summaries || false]
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
     * Read a Users
     * @param {number} id
     * @returns {Users | { message: string }}
     */
    static async read(id: number): Promise<Users | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM users WHERE id = $1',
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
     * Paginate Userss
     * @param {number} page
     * @param {number} limit
     * @returns {Users[] | { message: string }}
     */
    static async paginate(page: number, limit: number): Promise<Users[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM users ORDER BY id DESC LIMIT $1 OFFSET $2',
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
     * Get many Userss
     * @param {number[]} ids
     * @returns {Users[] | { message: string }}
     */
    static async getMany(ids: number[]): Promise<Users[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM users WHERE id = ANY($1)',
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
     * Get all Userss
     * @returns {Users[] | { message: string }}
     */
    static async getAll(): Promise<Users[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM users ORDER BY id DESC',
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
     * Update a Users
     * @param {Partial<Users>} data
     * @returns {Users | { message: string }}
     */
    static async update(data: Partial<Users>): Promise<Users | { message: string }> {
    const UsersValidator = Joi.object({
    api_key: Joi.string().allow(null).allow(''),
    created_at: Joi.date().allow(null).allow(''),
    email: Joi.string().allow(null).allow(''),
    first_name: Joi.string().allow(null).allow(''),
    id: Joi.number().allow(null).allow(''),
    image: Joi.string().allow(null).allow(''),
    last_name: Joi.string().allow(null).allow(''),
    max_tokens_per_request: Joi.number().allow(null).allow(''),
    openai_key: Joi.string().allow(null).allow(''),
    updated_at: Joi.date().allow(null).allow(''),
    use_ai_for_summaries: Joi.boolean().allow(null).allow('')
});

        const { error } = UsersValidator.validate(data);
        if (error) {
            return { message: error.message };
        }

        const client = this.connectDB();
        const query = {
            text: 'UPDATE users SET api_key = $1, created_at = $2, email = $3, first_name = $4, image = $5, last_name = $6, max_tokens_per_request = $7, openai_key = $8, updated_at = $9, use_ai_for_summaries = $10 WHERE id = $11 RETURNING *',
            values: [data.api_key || '', data.created_at || new Date(), data.email || '', data.first_name || '', data.image || '', data.last_name || '', data.max_tokens_per_request || 0, data.openai_key || '', data.updated_at || new Date(), data.use_ai_for_summaries || false, data.id]
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
     * Delete a Users
     * @param {number} id
     * @returns {Users | { message: string }}
     */
    static async delete(id: number): Promise<Users | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'DELETE FROM users WHERE id = $1 RETURNING *',
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

export default Users;
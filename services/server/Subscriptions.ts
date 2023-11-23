import Joi from 'joi';
import { Client } from 'pg';

/**
 * Subscriptions Model
 */
class Subscriptions {
    declare auth: string;
    declare created_at: Date;
    declare endpoint: string;
    declare expiration_date: Date;
    declare id: number;
    declare p256dh: string;
    declare user_id: number;

    /**
     * Create a new Subscriptions
     * @param {Partial<Subscriptions>} data
     * @returns {Subscriptions | { message: string }}
     */

    constructor(init?: Partial<Subscriptions>) {
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
     * Create a new Subscriptions
     * @param {Partial<Subscriptions>} data
     * @returns {Subscriptions | { message: string }}
     */
    static async create(data: Partial<Subscriptions>): Promise<Subscriptions | { message: string }> {
    const SubscriptionsValidator = Joi.object({
    auth: Joi.string().allow(null).allow(''),
    endpoint: Joi.string().allow(null).allow(''),
    expiration_date: Joi.date().allow(null).allow(''),
    p256dh: Joi.string().allow(null).allow(''),
    user_id: Joi.number().allow(null).allow('')
});

        const { error } = SubscriptionsValidator.validate(data);
        if (error) {
            return { message: error.message };
        }

        const client = this.connectDB();
        const query = {
            text: 'INSERT INTO subscriptions(auth, created_at, endpoint, expiration_date, p256dh, user_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
            values: [data.auth || '', data.created_at || new Date(), data.endpoint || '', data.expiration_date || new Date(), data.p256dh || '', data.user_id || 0]
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
     * Read a Subscriptions
     * @param {number} id
     * @returns {Subscriptions | { message: string }}
     */
    static async read(id: number): Promise<Subscriptions | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM subscriptions WHERE id = $1',
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
     * Paginate Subscriptionss
     * @param {number} page
     * @param {number} limit
     * @returns {Subscriptions[] | { message: string }}
     */
    static async paginate(page: number, limit: number): Promise<Subscriptions[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM subscriptions ORDER BY id DESC LIMIT $1 OFFSET $2',
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
     * Get many Subscriptionss
     * @param {number[]} ids
     * @returns {Subscriptions[] | { message: string }}
     */
    static async getMany(ids: number[]): Promise<Subscriptions[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM subscriptions WHERE id = ANY($1)',
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
     * Get all Subscriptionss
     * @returns {Subscriptions[] | { message: string }}
     */
    static async getAll(): Promise<Subscriptions[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM subscriptions ORDER BY id DESC',
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
     * Update a Subscriptions
     * @param {Partial<Subscriptions>} data
     * @returns {Subscriptions | { message: string }}
     */
    static async update(data: Partial<Subscriptions>): Promise<Subscriptions | { message: string }> {
    const SubscriptionsValidator = Joi.object({
    auth: Joi.string().allow(null).allow(''),
    created_at: Joi.date().allow(null).allow(''),
    endpoint: Joi.string().allow(null).allow(''),
    expiration_date: Joi.date().allow(null).allow(''),
    id: Joi.number().allow(null).allow(''),
    p256dh: Joi.string().allow(null).allow(''),
    user_id: Joi.number().allow(null).allow('')
});

        const { error } = SubscriptionsValidator.validate(data);
        if (error) {
            return { message: error.message };
        }

        const client = this.connectDB();
        const query = {
            text: 'UPDATE subscriptions SET auth = $1, created_at = $2, endpoint = $3, expiration_date = $4, p256dh = $5, user_id = $6 WHERE id = $7 RETURNING *',
            values: [data.auth || '', data.created_at || new Date(), data.endpoint || '', data.expiration_date || new Date(), data.p256dh || '', data.user_id || 0, data.id]
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
     * Delete a Subscriptions
     * @param {number} id
     * @returns {Subscriptions | { message: string }}
     */
    static async delete(id: number): Promise<Subscriptions | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'DELETE FROM subscriptions WHERE id = $1 RETURNING *',
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

export default Subscriptions;
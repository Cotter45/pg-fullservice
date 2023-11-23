import Joi from 'joi';
import { Client } from 'pg';

/**
 * Tasks Model
 */
class Tasks {
    declare completed_at: Date;
    declare created_at: Date;
    declare description: string;
    declare due_date: Date;
    declare end_datetime: Date;
    declare event_color: string;
    declare focus_id: number;
    declare fts_doc_en: any;
    declare goal_id: number;
    declare id: number;
    declare is_all_day: boolean;
    declare priority: number;
    declare recurring: boolean;
    declare recurring_ends_on: Date;
    declare recurring_every: number;
    declare recurring_interval: string;
    declare start_datetime: Date;
    declare status: string;
    declare title: string;
    declare updated_at: Date;
    declare user_id: number;

    /**
     * Create a new Tasks
     * @param {Partial<Tasks>} data
     * @returns {Tasks | { message: string }}
     */

    constructor(init?: Partial<Tasks>) {
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
     * Create a new Tasks
     * @param {Partial<Tasks>} data
     * @returns {Tasks | { message: string }}
     */
    static async create(data: Partial<Tasks>): Promise<Tasks | { message: string }> {
    const TasksValidator = Joi.object({
    completed_at: Joi.date().allow(null).allow(''),
    description: Joi.string().allow(null).allow(''),
    due_date: Joi.date().allow(null).allow(''),
    end_datetime: Joi.date().allow(null).allow(''),
    event_color: Joi.string().allow(null).allow(''),
    focus_id: Joi.number().allow(null).allow(''),
    fts_doc_en: Joi.any().allow(null).allow(''),
    goal_id: Joi.number().allow(null).allow(''),
    is_all_day: Joi.boolean().allow(null).allow(''),
    priority: Joi.number().allow(null).allow(''),
    recurring: Joi.boolean().allow(null).allow(''),
    recurring_ends_on: Joi.date().allow(null).allow(''),
    recurring_every: Joi.number().allow(null).allow(''),
    recurring_interval: Joi.string().allow(null).allow(''),
    start_datetime: Joi.date().allow(null).allow(''),
    status: Joi.string().allow(null).allow(''),
    title: Joi.string().allow(null).allow(''),
    user_id: Joi.number().allow(null).allow('')
});

        const { error } = TasksValidator.validate(data);
        if (error) {
            return { message: error.message };
        }

        const client = this.connectDB();
        const query = {
            text: 'INSERT INTO tasks(completed_at, created_at, description, due_date, end_datetime, event_color, focus_id, fts_doc_en, goal_id, is_all_day, priority, recurring, recurring_ends_on, recurring_every, recurring_interval, start_datetime, status, title, updated_at, user_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING *',
            values: [data.completed_at || new Date(), data.created_at || new Date(), data.description || '', data.due_date || new Date(), data.end_datetime || new Date(), data.event_color || '', data.focus_id || 0, data.fts_doc_en || null, data.goal_id || 0, data.is_all_day || false, data.priority || 0, data.recurring || false, data.recurring_ends_on || new Date(), data.recurring_every || 0, data.recurring_interval || '', data.start_datetime || new Date(), data.status || '', data.title || '', data.updated_at || new Date(), data.user_id || 0]
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
     * Read a Tasks
     * @param {number} id
     * @returns {Tasks | { message: string }}
     */
    static async read(id: number): Promise<Tasks | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM tasks WHERE id = $1',
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
     * Paginate Taskss
     * @param {number} page
     * @param {number} limit
     * @returns {Tasks[] | { message: string }}
     */
    static async paginate(page: number, limit: number): Promise<Tasks[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM tasks ORDER BY id DESC LIMIT $1 OFFSET $2',
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
     * Get many Taskss
     * @param {number[]} ids
     * @returns {Tasks[] | { message: string }}
     */
    static async getMany(ids: number[]): Promise<Tasks[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM tasks WHERE id = ANY($1)',
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
     * Get all Taskss
     * @returns {Tasks[] | { message: string }}
     */
    static async getAll(): Promise<Tasks[] | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'SELECT * FROM tasks ORDER BY id DESC',
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
     * Update a Tasks
     * @param {Partial<Tasks>} data
     * @returns {Tasks | { message: string }}
     */
    static async update(data: Partial<Tasks>): Promise<Tasks | { message: string }> {
    const TasksValidator = Joi.object({
    completed_at: Joi.date().allow(null).allow(''),
    created_at: Joi.date().allow(null).allow(''),
    description: Joi.string().allow(null).allow(''),
    due_date: Joi.date().allow(null).allow(''),
    end_datetime: Joi.date().allow(null).allow(''),
    event_color: Joi.string().allow(null).allow(''),
    focus_id: Joi.number().allow(null).allow(''),
    fts_doc_en: Joi.any().allow(null).allow(''),
    goal_id: Joi.number().allow(null).allow(''),
    id: Joi.number().allow(null).allow(''),
    is_all_day: Joi.boolean().allow(null).allow(''),
    priority: Joi.number().allow(null).allow(''),
    recurring: Joi.boolean().allow(null).allow(''),
    recurring_ends_on: Joi.date().allow(null).allow(''),
    recurring_every: Joi.number().allow(null).allow(''),
    recurring_interval: Joi.string().allow(null).allow(''),
    start_datetime: Joi.date().allow(null).allow(''),
    status: Joi.string().allow(null).allow(''),
    title: Joi.string().allow(null).allow(''),
    updated_at: Joi.date().allow(null).allow(''),
    user_id: Joi.number().allow(null).allow('')
});

        const { error } = TasksValidator.validate(data);
        if (error) {
            return { message: error.message };
        }

        const client = this.connectDB();
        const query = {
            text: 'UPDATE tasks SET completed_at = $1, created_at = $2, description = $3, due_date = $4, end_datetime = $5, event_color = $6, focus_id = $7, fts_doc_en = $8, goal_id = $9, is_all_day = $10, priority = $11, recurring = $12, recurring_ends_on = $13, recurring_every = $14, recurring_interval = $15, start_datetime = $16, status = $17, title = $18, updated_at = $19, user_id = $20 WHERE id = $21 RETURNING *',
            values: [data.completed_at || new Date(), data.created_at || new Date(), data.description || '', data.due_date || new Date(), data.end_datetime || new Date(), data.event_color || '', data.focus_id || 0, data.fts_doc_en || null, data.goal_id || 0, data.is_all_day || false, data.priority || 0, data.recurring || false, data.recurring_ends_on || new Date(), data.recurring_every || 0, data.recurring_interval || '', data.start_datetime || new Date(), data.status || '', data.title || '', data.updated_at || new Date(), data.user_id || 0, data.id]
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
     * Delete a Tasks
     * @param {number} id
     * @returns {Tasks | { message: string }}
     */
    static async delete(id: number): Promise<Tasks | { message: string }> {
        const client = this.connectDB();
        const query = {
            text: 'DELETE FROM tasks WHERE id = $1 RETURNING *',
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

export default Tasks;
import Joi from 'joi';
import { Client } from 'pg';

/**
 * Activity Model
 */
class Activity {
  declare created_at: Date;
  declare focus_id: number;
  declare goal_id: number;
  declare id: number;
  declare message: string;
  declare task_id: number;
  declare type: string;
  declare user_id: number;

  /**
   * Create a new Activity
   * @param {Partial<Activity>} data
   * @returns {Activity | { message: string }}
   */

  constructor(init?: Partial<Activity>) {
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
   * Create a new Activity
   * @param {Partial<Activity>} data
   * @returns {Activity | { message: string }}
   */
  static async create(
    data: Partial<Activity>,
  ): Promise<Activity | { message: string }> {
    const ActivityValidator = Joi.object({
      focus_id: Joi.number().allow(null).allow(''),
      goal_id: Joi.number().allow(null).allow(''),
      message: Joi.string().allow(null).allow(''),
      task_id: Joi.number().allow(null).allow(''),
      type: Joi.string().allow(null).allow(''),
      user_id: Joi.number().allow(null).allow(''),
    });

    const { error } = ActivityValidator.validate(data);
    if (error) {
      return { message: error.message };
    }

    const client = this.connectDB();
    const query = {
      text: 'INSERT INTO activity(created_at, focus_id, goal_id, message, task_id, type, user_id) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      values: [
        data.created_at || new Date(),
        data.focus_id || 0,
        data.goal_id || 0,
        data.message || '',
        data.task_id || 0,
        data.type || '',
        data.user_id || 0,
      ],
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
   * Read a Activity
   * @param {number} id
   * @returns {Activity | { message: string }}
   */
  static async read(id: number): Promise<Activity | { message: string }> {
    const client = this.connectDB();
    const query = {
      text: 'SELECT * FROM activity WHERE id = $1',
      values: [id],
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
   * Paginate Activitys
   * @param {number} page
   * @param {number} limit
   * @returns {Activity[] | { message: string }}
   */
  static async paginate(
    page: number,
    limit: number,
  ): Promise<Activity[] | { message: string }> {
    const client = this.connectDB();
    const query = {
      text: 'SELECT * FROM activity ORDER BY id DESC LIMIT $1 OFFSET $2',
      values: [limit, (page - 1) * limit],
    };
    try {
      await client.connect();
      const result = await client.query(query);
      return result.rows;
    } catch (error: any) {
      return { message: error.message };
    } finally {
      await client.end();
    }
  }

  /**
   * Get many Activitys
   * @param {number[]} ids
   * @returns {Activity[] | { message: string }}
   */
  static async getMany(
    ids: number[],
  ): Promise<Activity[] | { message: string }> {
    const client = this.connectDB();
    const query = {
      text: 'SELECT * FROM activity WHERE id = ANY($1)',
      values: [ids],
    };
    try {
      await client.connect();
      const result = await client.query(query);
      return result.rows;
    } catch (error: any) {
      return { message: error.message };
    } finally {
      await client.end();
    }
  }

  /**
   * Get all Activitys
   * @returns {Activity[] | { message: string }}
   */
  static async getAll(): Promise<Activity[] | { message: string }> {
    const client = this.connectDB();
    const query = {
      text: 'SELECT * FROM activity ORDER BY id DESC',
      values: [],
    };
    try {
      await client.connect();
      const result = await client.query(query);
      return result.rows;
    } catch (error: any) {
      return { message: error.message };
    } finally {
      await client.end();
    }
  }

  /**
   * Update a Activity
   * @param {Partial<Activity>} data
   * @returns {Activity | { message: string }}
   */
  static async update(
    data: Partial<Activity>,
  ): Promise<Activity | { message: string }> {
    const ActivityValidator = Joi.object({
      created_at: Joi.date().allow(null).allow(''),
      focus_id: Joi.number().allow(null).allow(''),
      goal_id: Joi.number().allow(null).allow(''),
      id: Joi.number().allow(null).allow(''),
      message: Joi.string().allow(null).allow(''),
      task_id: Joi.number().allow(null).allow(''),
      type: Joi.string().allow(null).allow(''),
      user_id: Joi.number().allow(null).allow(''),
    });

    const { error } = ActivityValidator.validate(data);
    if (error) {
      return { message: error.message };
    }

    const client = this.connectDB();
    const query = {
      text: 'UPDATE activity SET created_at = $1, focus_id = $2, goal_id = $3, message = $4, task_id = $5, type = $6, user_id = $7 WHERE id = $8 RETURNING *',
      values: [
        data.created_at || new Date(),
        data.focus_id || 0,
        data.goal_id || 0,
        data.message || '',
        data.task_id || 0,
        data.type || '',
        data.user_id || 0,
        data.id,
      ],
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
   * Delete a Activity
   * @param {number} id
   * @returns {Activity | { message: string }}
   */
  static async delete(id: number): Promise<Activity | { message: string }> {
    const client = this.connectDB();
    const query = {
      text: 'DELETE FROM activity WHERE id = $1 RETURNING *',
      values: [id],
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
}

export default Activity;

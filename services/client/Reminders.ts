class Reminders {
    declare id: number;
    declare message: string;
    declare time: Date;
    declare interval: string;
    declare type: string;
    declare email: string;
    declare task_id: number;
    declare user_id: number;
    declare created_at: Date;
    declare updated_at: Date;

    constructor(init?: Partial<Reminders>) {
        Object.assign(this, init);
    }

};
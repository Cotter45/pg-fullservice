class Subtasks {
    declare id: number;
    declare title: string;
    declare status: string;
    declare position: number;
    declare task_id: number;
    declare user_id: number;
    declare created_at: Date;

    constructor(init?: Partial<Subtasks>) {
        Object.assign(this, init);
    }

};
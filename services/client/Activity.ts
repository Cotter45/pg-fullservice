class Activity {
    declare id: number;
    declare type: string;
    declare message: string;
    declare user_id: number;
    declare task_id: number;
    declare goal_id: number;
    declare focus_id: number;
    declare created_at: Date;

    constructor(init?: Partial<Activity>) {
        Object.assign(this, init);
    }

};
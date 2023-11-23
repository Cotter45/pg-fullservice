class Goals {
    declare id: number;
    declare title: string;
    declare description: string;
    declare priority: number;
    declare status: string;
    declare ai_summary: string;
    declare user_id: number;
    declare focus_id: number;
    declare created_at: Date;
    declare updated_at: Date;

    constructor(init?: Partial<Goals>) {
        Object.assign(this, init);
    }

};
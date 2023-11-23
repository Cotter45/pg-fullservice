class Focus {
    declare id: number;
    declare name: string;
    declare description: string;
    declare status: string;
    declare ai_summary: string;
    declare user_id: number;
    declare created_at: Date;
    declare updated_at: Date;

    constructor(init?: Partial<Focus>) {
        Object.assign(this, init);
    }

};
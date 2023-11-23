class Tasks {
    declare id: number;
    declare title: string;
    declare description: string;
    declare priority: number;
    declare status: string;
    declare recurring: boolean;
    declare recurring_every: number;
    declare recurring_interval: string;
    declare recurring_ends_on: Date;
    declare due_date: Date;
    declare completed_at: Date;
    declare start_datetime: Date;
    declare end_datetime: Date;
    declare is_all_day: boolean;
    declare event_color: string;
    declare user_id: number;
    declare goal_id: number;
    declare focus_id: number;
    declare created_at: Date;
    declare updated_at: Date;
    declare fts_doc_en: any;

    constructor(init?: Partial<Tasks>) {
        Object.assign(this, init);
    }

};
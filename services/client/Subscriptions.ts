class Subscriptions {
    declare id: number;
    declare endpoint: string;
    declare expiration_date: Date;
    declare p256dh: string;
    declare auth: string;
    declare user_id: number;
    declare created_at: Date;

    constructor(init?: Partial<Subscriptions>) {
        Object.assign(this, init);
    }

};
class Users {
    declare id: number;
    declare first_name: string;
    declare last_name: string;
    declare email: string;
    declare image: string;
    declare openai_key: string;
    declare use_ai_for_summaries: boolean;
    declare max_tokens_per_request: number;
    declare created_at: Date;
    declare updated_at: Date;
    declare api_key: string;

    constructor(init?: Partial<Users>) {
        Object.assign(this, init);
    }

};
export type Spec = {
    column_name: string;
    data_type: string;
    is_nullable: string;
    is_foreign_key: boolean;
    referenced_table_name: string | null;
};
export type MappedSpec = {
    name: string;
    type: string;
    isNullable: string;
    isForeignKey: boolean;
    referencedTable: string | null;
};
export type Schema = {
    [key: string]: Spec[];
};

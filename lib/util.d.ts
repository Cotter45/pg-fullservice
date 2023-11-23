export declare function convertDBTypeToTsType(dbType: string): "string" | "number" | "boolean" | "Date" | "any";
export declare const typeToValue: (dbType: string) => "false" | "0" | "''" | "new Date()" | "null";
export declare const snakeToPascal: (str: string) => string;

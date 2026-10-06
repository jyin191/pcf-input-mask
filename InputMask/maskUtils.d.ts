export declare function normalizeRawValue(value: string, mask: string, placeholderChar: string): string;
export declare function applyMask(value: string, mask: string, placeholderChar?: string, allowOverflow?: boolean): string;
export declare function normalizePhone(text: string, placeholderChar?: string): string;
export declare function formatPhone(raw: string, mask: string, placeholderChar?: string, allowOverflow?: boolean): string;
export declare function getPatternType(token: string): "digit" | "alpha" | "alphanumeric" | "any" | null;
export declare function matchesToken(character: string, pattern: "digit" | "alpha" | "alphanumeric" | "any"): boolean;

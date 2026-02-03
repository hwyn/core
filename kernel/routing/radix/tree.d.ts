export interface TreeMatchResult<T> {
    payload: T;
    params: Record<string, string>;
}
export declare class RadixTree<T> {
    private root;
    insert(path: string, payload: T): void;
    search(path: string): TreeMatchResult<T> | null;
    private splitPath;
    private findNode;
}

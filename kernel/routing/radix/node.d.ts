import { PipelineRunner } from '../../compiler/ast/plan';
export declare const enum NodeType {
    STATIC = 0,
    PARAM = 1,// :id
    WILDCARD = 2,// *
    DEEP = 3
}
export declare const enum NodeFlag {
    NONE = 0,
    HAS_STORE = 1
}
export declare class RadixNode {
    children: Map<string, RadixNode>;
    dynamic: Array<{
        type: NodeType;
        node: RadixNode;
        param?: string;
    }>;
    store: {
        runner: PipelineRunner;
        params: string[];
    } | null;
    getOrCreateStatic(path: string): RadixNode;
    getOrCreateDynamic(type: NodeType, param?: string): RadixNode;
}

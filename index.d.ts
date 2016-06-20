// Type definitions for terrific-singleton
declare interface TerrifcSpec {
  start: (resolve: (value?: any) => void, reject?: (error?: any) => void) => void;
  [others: string]: any;
}

declare class TerrificEventEmitter {
    _listeners: any;
    _sandbox: TerrificSandbox;
    _connected: boolean;

    constructor(sandbox: TerrificSandbox);

    on(event: string, listener: (...allArguments: any[]) => void): TerrificEventEmitter;
    addListener(event: string, listener: (...allArguments: any[]) => void): TerrificEventEmitter;
    once(event: string, listener: (...allArguments: any[]) => void): TerrificEventEmitter;
    off(): TerrificEventEmitter;
    off(event: string): TerrificEventEmitter;
    off(event: string, listener: Function): TerrificEventEmitter;
    removeListener(): TerrificEventEmitter;
    removeListener(event: string): TerrificEventEmitter;
    removeListener(event: string, listener: Function): TerrificEventEmitter;
    removeAllListeners(event: string): TerrificEventEmitter;
    emit(...allArguments: any[]): TerrificEventEmitter;
    handle(event: string, ...allArguments: any[]): TerrificEventEmitter;
    listeners(event: string): ((...allArguments: any[]) => void)[];
    hasListeners(event: string): boolean;
    connect(): TerrificEventEmitter;
    disconnect(): TerrificEventEmitter;
}

declare class TerrificSandbox {
    _application: any;
    _eventEmitters: TerrificEventEmitter[];

    constructor(application: any);

    addModules(ctx: Node): TerrificModule[];
    removeModules(modules: Node|TerrificModule[]): TerrificSandbox;
    getModuleById(id: number): TerrificModule;
    getConfig(): any;
    getConfigParam(name: string): any;
    addEventEmitter(eventEmitter: TerrificEventEmitter): TerrificSandbox;
    removeEventEmitter(eventEmitter: TerrificEventEmitter): TerrificSandbox;
    dispatch(...allArguments: any[]): TerrificSandbox;
}

declare class TerrificModule implements TerrifcSpec {
  start: (resolve: (value?: any) => void, reject?: (error?: any) => void) => void;
  stop(): void;
  _ctx: Node;
  _sandbox: TerrificSandbox;
  _events: TerrificEventEmitter;
  api: any;
}


export function createModule(name:string, spec: TerrifcSpec): TerrificModule;
export function startNode(node: Node): TerrificModule;
export function stopNode(node: Node): void;
export function bootstrap(): void;
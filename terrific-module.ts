/// <reference path="terrific.d.ts" />

export abstract class TerrificSpec implements TerrificModule {
  _ctx: HTMLElement;
  api: any;
  abstract start(resolve: (value?: any) => void, reject?: (error?: any) => void): void;
  abstract stop(): void;
}

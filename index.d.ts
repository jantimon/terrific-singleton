/// <reference path="terrific.d.ts" />
import {TerrificSpec} from './terrific-module';

interface ITerrificSpec {
    new (): TerrificSpec;
}

export function createModule(name:string, spec: ITerrificSpec): TerrificModule;
export function startNode(node: Node): TerrificModule;
export function stopNode(node: Node): void;
export function getModuleByDomNode(node: HTMLElement): TerrificSpec;
export function bootstrap(): Promise<Array<any>>;
export function waitForBootstrap(): Promise<Array<any>>;

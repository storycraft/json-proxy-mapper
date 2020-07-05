/*
 * Created on Tue May 19 2020
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

import { Serializer } from "./serializer";

export interface TypeConverter<T> {

    getFromRaw(target: any, rawKey: PropertyKey, receiver: any): T;
    setToRaw(target: any, rawKey: PropertyKey, value: T, receiver: any): boolean;

}

export interface NameMapping {
    
    // namedKey: 'obfuscated key'
    [key: string]: PropertyKey,

}

export interface ConvertMap {

    // namedKey: converter
    [key: string]: TypeConverter<any>,

}

export abstract class ObjectMapperBase implements ProxyHandler<any> {

    abstract getConverterFor<T>(key: PropertyKey): TypeConverter<T> | null;

    abstract getMappingKeys(): PropertyKey[];
    abstract getRawKey(key: PropertyKey): PropertyKey | null;

    abstract ownKeys(target: any): PropertyKey[];

    abstract has(target: any, key: PropertyKey): boolean;

    abstract get(target: any, key: PropertyKey, receiver: any): any;
    abstract set(target: any, key: PropertyKey, value: any, receiver: any): boolean;

}

export class ObjectMapper extends ObjectMapperBase {

    constructor(private mappings: NameMapping, private convertMap: ConvertMap | null = null) {
        super();
    }

    getMappingKeys() {
        return Reflect.ownKeys(this.mappings);
    }

    ownKeys(target: any): PropertyKey[] {
        return this.getMappingKeys();
    }

    getConverterFor<T>(key: PropertyKey) {
        if (this.convertMap && Reflect.has(this.convertMap, key)) {
            return Reflect.get(this.convertMap, key) as TypeConverter<T>;
        }

        return null;
    }

    has(target: any, key: PropertyKey): boolean {
        let rawKey = this.getRawKey(key);

        if (!rawKey) return false;

        return Reflect.has(target, rawKey);
    }

    getRawKey(key: PropertyKey) {
        if (Reflect.has(this.mappings, key)) return Reflect.get(this.mappings, key) as PropertyKey;

        return null;
    }

    getOwnPropertyDescriptor(target: any, key: PropertyKey): PropertyDescriptor | undefined {
        let rawKey = this.getRawKey(key);

        if (rawKey) {
            return Reflect.getOwnPropertyDescriptor(target, rawKey);
        }
    }

    get(target: any, key: PropertyKey, receiver: any) {
        if (!target) return;

        let rawKey = this.getRawKey(key);

        if (rawKey) {
            let converter = this.getConverterFor(key);
            if (converter && Reflect.has(target, rawKey)) {
                return converter.getFromRaw(target, rawKey, receiver);
            }

            return Reflect.get(target, rawKey, receiver);
        }

    }

    set(target: any, key: PropertyKey, value: any, receiver: any): boolean {
        if (!target) return false;

        let rawKey = this.getRawKey(key);

        if (rawKey) {
            let converter = this.getConverterFor(key);
            if (converter) {
                return converter.setToRaw(target, rawKey, value, receiver);
            }

            Reflect.set(target, rawKey, value, receiver);
         
            return Reflect.set(target, rawKey, value, receiver);
        }

        return false;
    }

}

export type PartialNamedArray<T> = {

    [index: number]: T;
    
} & Array<unknown>;

export class ArrayMapper extends ObjectMapperBase {

    private arrayMap: WeakMap<object, any>;
    private objectMapper: ObjectMapper;

    constructor(private objMappings: NameMapping, private objConvertMap: ConvertMap | null = null) {
        super();

        this.arrayMap = new WeakMap();
        this.objectMapper = new ObjectMapper(this.objMappings, this.objConvertMap);
    }

    get ObjectMapper() {
        return this.objectMapper;
    }

    getConverterFor<T>(key: PropertyKey): TypeConverter<T> | null {
        return null;
    }
    
    getMappingKeys(): PropertyKey[] {
        return [];
    }

    ownKeys(target: any) {
        return Reflect.ownKeys(target);
    }

    getRawKey(key: PropertyKey): PropertyKey | null {
        return key;
    }

    has(target: any, key: PropertyKey): boolean {
        return Reflect.has(target, key);
    }

    protected isCoreKey(key: PropertyKey): boolean {
        return Reflect.ownKeys(Array.prototype).includes(key);
    }

    get(target: any, key: PropertyKey, receiver: any) {
        if (!target) return;

        let val = Reflect.get(target, key, receiver);
        if (this.isCoreKey(key)) return val;

        return this.getProxyFor(val);
    }

    set(target: any, key: PropertyKey, value: any, receiver: any): boolean {
       if (this.isCoreKey(key)) return Reflect.set(target, key, value, receiver);

       return Reflect.set(target, key, Serializer.serialize(value, this.objectMapper), receiver);
    }

    protected getProxyFor(rawObj: any) {
        if (!rawObj) return null;
        if (this.arrayMap.has(rawObj)) return this.arrayMap.get(rawObj)!;

        let converted = new Proxy(rawObj, this.objectMapper);

        this.arrayMap.set(rawObj, converted);

        return converted;
    }
    
}
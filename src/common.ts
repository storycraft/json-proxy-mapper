/*
 * Created on Tue May 19 2020
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

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

export interface ObjectMapperBase {

    getConverterFor<T>(key: PropertyKey): TypeConverter<T> | null;

    getMappingKeys(): PropertyKey[];
    getRawKey(key: PropertyKey): PropertyKey | null;

    has(target: any, key: PropertyKey): boolean;

    get(target: any, key: PropertyKey, receiver: any): any;
    set(target: any, key: PropertyKey, value: any, receiver: any): boolean;

}

export class ObjectMapper implements ObjectMapperBase, ProxyHandler<any> {

    constructor(private mappings: NameMapping, private convertMap: ConvertMap | null = null) {
        
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

    getMappingKeys() {
        return Reflect.ownKeys(this.mappings);
    }

    ownKeys(target: any): PropertyKey[] {
        return this.getMappingKeys();
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
/*
 * Created on Mon May 18 2020
 *
 * Copyright (c) storycraft. Licensed under the Apache-2.0 Licence.
 */

export class WrappedObject<T extends object> {

    public readonly named: T;
    public readonly original: any;
    
    constructor (target: any, handler: ObjectMapper) {
        this.original = target;

        this.named = new Proxy<T>(target, handler);
    }

    static createFrom<T extends object>(named: T, handler: ObjectMapper): WrappedObject<T> {
        let wrapped = new WrappedObject<T>({}, handler);

        Reflect.ownKeys(named).forEach(p => Reflect.set(wrapped.named, p, Reflect.get(named, p)));

        return wrapped;
    }

}
export interface TypeConverter<T> {

    getFromRaw(target: any, rawKey: PropertyKey, receiver?: any): T;
    setToRaw(target: any, rawKey: PropertyKey, value: T, receiver?: any): boolean;

}

export interface NameMapping {
    
    // namedKey: 'obfuscated key'
    [key: string]: string,

}

export interface ConvertMap {

    // namedKey: converter
    [key: string]: TypeConverter<any>,

}

export namespace Converter {

    export abstract class Immutable<T extends object> implements TypeConverter<T> {

        private objectMap: WeakMap<object, T>;

        constructor(
            protected readonly mapper: ObjectMapper
        ) {
            this.objectMap = new WeakMap();
        }

        getFromRaw(target: any, rawKey: PropertyKey, receiver?: any): T {
            let rawObj = Reflect.get(target, rawKey);
            
            if (this.objectMap.has(rawObj)) return this.objectMap.get(rawObj)!;

            let cache = this.createConverted(rawObj);

            this.objectMap.set(rawObj, cache);

            return cache;
        }

        abstract createConverted(rawObj: any): T;

        setToRaw(target: any, rawKey: PropertyKey, value: T, receiver?: any) {
            let rawObj: any = {};

            let namedKeys = Reflect.ownKeys(value);
            for(let namedKey of namedKeys) {
                this.mapper.set(rawObj, namedKey, Reflect.get(value, namedKey), rawObj);
            }
            
            return Reflect.set(target, rawKey, rawObj, receiver);
        }

    }

    export class Object<T extends object> extends Immutable<T> {

        constructor(
            mapper: ObjectMapper
        ) {
            super(mapper);
        }

        createConverted(rawObj: any): T {
            return new Proxy<T>(rawObj, this.mapper);
        }

    }
}

export class ObjectMapper implements ProxyHandler<any> {

    constructor(private mappings: NameMapping, private convertMap?: ConvertMap) {
        
    }

    has(target: any, p: PropertyKey): boolean {
        return Reflect.has(this.mappings, p);
    }

    ownKeys(target: any): PropertyKey[] {
        return Reflect.ownKeys(this.mappings);
    }

    getOwnPropertyDescriptor(target: any, key: PropertyKey): PropertyDescriptor | undefined {
        if (Reflect.has(this.mappings, key)) {
            let rawKey = Reflect.get(this.mappings, key);

            return Reflect.getOwnPropertyDescriptor(target, rawKey);
        }
    }

    get(target: any, key: PropertyKey, receiver?: any) {
        if (Reflect.has(this.mappings, key)) {

            let rawKey = Reflect.get(this.mappings, key);

            if (this.convertMap && Reflect.has(this.convertMap, key)) {
                let converter = Reflect.get(this.convertMap, key) as TypeConverter<any>;

                if (Reflect.has(target, rawKey)) return converter.getFromRaw(target, rawKey, receiver);
            }

            return Reflect.get(target, rawKey, receiver);
        }

    }

    set(target: any, key: PropertyKey, value: any, receiver?: any): boolean {
        if (Reflect.has(this.mappings, key)) {
            let rawKey = Reflect.get(this.mappings, key);

            if (this.convertMap && Reflect.has(this.convertMap, key)) {
                let converter = Reflect.get(this.convertMap, key) as TypeConverter<any>;

                return converter.setToRaw(target, rawKey, value, receiver);
            }

            Reflect.set(target, rawKey, value, receiver);
         
            return Reflect.set(target, rawKey, value, receiver);
        }

        return false;
    }

}
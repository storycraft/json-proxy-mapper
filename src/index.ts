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

    getFromRaw(target: any, key: PropertyKey, rawKey: PropertyKey, receiver?: any): T;
    setToRaw(target: any, key: PropertyKey, rawKey: PropertyKey, value: T, receiver?: any): boolean;

    defaultVal?: T;

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

    export function setDefault<T>(defaultVal: T): TypeConverter<T> {
        return {
            
            getFromRaw: (target: any, key: string, rawKey: PropertyKey, receiver?: any) => Reflect.get(target, rawKey, receiver),
            setToRaw: (target: any, key: PropertyKey, rawKey: PropertyKey, value: any, receiver?: any) => Reflect.set(target, rawKey, value, receiver),

            defaultVal: defaultVal
        }
    }

    export const NUMBER = setDefault<number>(0);
    export const STRING = setDefault<string>('');
    export const BOOL = setDefault<boolean>(false);

    export class Object<T extends object> implements TypeConverter<T> {

        public defaultVal?: T;

        private ref?: T;
        private cache?: T;

        constructor(
            private mapper: ObjectMapper,
            defaultVal?: T
        ) {
            this.defaultVal = defaultVal;
        }

        getFromRaw(target: any, key: string, rawKey: PropertyKey, receiver?: any): T {
            if (this.ref === target) return this.cache!;

            this.ref = target;

            return this.cache = new Proxy<T>(Reflect.get(target, rawKey), this.mapper);
        }

        setToRaw(target: any, key: PropertyKey, rawKey: PropertyKey, value: T, receiver?: any) {
            let rawObj: any = {};

            let namedKeys = Reflect.ownKeys(value);
            for(let namedKey of namedKeys) {
                this.mapper.set(rawObj, namedKey, Reflect.get(value, namedKey), rawObj);
            }
            
            return Reflect.set(target, rawKey, rawObj, receiver);
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

    get(target: any, key: PropertyKey, receiver?: any) {
        if (Reflect.has(this.mappings, key)) {

            let rawKey = Reflect.get(this.mappings, key);

            if (this.convertMap && Reflect.has(this.convertMap, key)) {
                let converter = Reflect.get(this.convertMap, key) as TypeConverter<any>;

                if (Reflect.has(target, rawKey)) return converter.getFromRaw(target, key, rawKey, receiver);

                if (converter.defaultVal) return converter.defaultVal;
            }

            return Reflect.get(target, rawKey, receiver);
        }

    }

    set(target: any, key: PropertyKey, value: any, receiver?: any): boolean {
        if (Reflect.has(this.mappings, key)) {
            let rawKey = Reflect.get(this.mappings, key);

            if (this.convertMap && Reflect.has(this.convertMap, key)) {
                let converter = Reflect.get(this.convertMap, key) as TypeConverter<any>;

                return converter.setToRaw(target, key, rawKey, value, receiver);
            }

            Reflect.set(target, rawKey, value, receiver);
         
            return Reflect.set(target, rawKey, value, receiver);
        }

        return false;
    }

}
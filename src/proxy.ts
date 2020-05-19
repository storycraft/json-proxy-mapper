/*
 * Created on Mon May 18 2020
 *
 * Copyright (c) storycraft. Licensed under the Apache-2.0 Licence.
 */

import { ObjectMapper, TypeConverter, NameMapping, ConvertMap } from "./common";

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

export namespace Converter {

    export abstract class ImmutableRef<T extends object> extends ObjectMapper implements TypeConverter<T> {

        private objectMap: WeakMap<object, T>;

        constructor(mappings: NameMapping, convertMap: ConvertMap | null = null) {
            super(mappings, convertMap);

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
                this.set(rawObj, namedKey, Reflect.get(value, namedKey), rawObj);
            }
            
            return Reflect.set(target, rawKey, rawObj, receiver);
        }

    }

    export class Object<T extends object> extends ImmutableRef<T> {

        createConverted(rawObj: any): T {
            return new Proxy<T>(rawObj, this);
        }

    }
}


/*
 * Created on Mon May 18 2020
 *
 * Copyright (c) storycraft. Licensed under the Apache-2.0 Licence.
 */

import { ObjectMapper, TypeConverter, NameMapping, ConvertMap, ObjectMapperBase, ArrayMapper, PartialNamedArray } from "./common";
import { Serializer } from "./serializer";

export class WrappedObject<T extends object> {

    public readonly named: T;
    public readonly original: any;
    
    constructor(target: any, handler: ObjectMapperBase) {
        this.original = target;

        this.named = new Proxy<T>(target, handler);
    }

    static createFrom<T extends object>(named: T, handler: ObjectMapperBase): WrappedObject<T> {
        let wrapped = new WrappedObject<T>({}, handler);

        Reflect.ownKeys(named).forEach(p => Reflect.set(wrapped.named, p, Reflect.get(named, p)));

        return wrapped;
    }

}

export class WrappedArray<T> extends WrappedObject<PartialNamedArray<T>> {

}

export namespace Converter {

    export abstract class ImmutableRef<T extends object> implements TypeConverter<T> {

        private objectMap: WeakMap<object, T>;

        public readonly mapper: ObjectMapperBase;

        constructor(mappings: NameMapping, convertMap: ConvertMap | null = null) {
            this.objectMap = new WeakMap();
            this.mapper = this.createMapper(mappings, convertMap);
        }

        protected abstract createMapper(mappings: NameMapping, convertMap: ConvertMap | null): ObjectMapperBase;

        getFromRaw(target: any, rawKey: PropertyKey, receiver?: any): T {
            let rawObj = Reflect.get(target, rawKey, receiver);
            
            if (this.objectMap.has(rawObj)) return this.objectMap.get(rawObj)!;

            let cache = this.createConverted(rawObj);

            this.objectMap.set(rawObj, cache);

            return cache;
        }

        abstract createConverted(rawObj: any): T;

        setToRaw(target: any, rawKey: PropertyKey, value: T, receiver?: any) {
            return Reflect.set(target, rawKey, Serializer.serialize(value, this.mapper), receiver);
        }

    }

    export class Object<T extends object> extends ImmutableRef<T> {

        createMapper(mappings: NameMapping, convertMap: ConvertMap | null = null) {
            return new ObjectMapper(mappings, convertMap);
        }

        createConverted(rawObj: any): T {
            return new Proxy<T>(rawObj, this.mapper);
        }

    }

    export class Array<T extends object> extends ImmutableRef<Array<T>> {

        createMapper(mappings: NameMapping, convertMap: ConvertMap | null = null) {
            return new ArrayMapper(mappings, convertMap);
        }

        createConverted(rawArr: any): Array<T> {
            return new Proxy(rawArr, this.mapper);
        }

    }
}


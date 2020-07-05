/*
 * Created on Tue May 19 2020
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

import { ObjectMapperBase, ArrayMapper } from "./common";
import { Converter } from "./proxy";

export namespace Serializer {

    export function serialize<T extends object>(obj: T[], mapper: ArrayMapper): any[]
    export function serialize<T extends object>(obj: T, mapper: ObjectMapperBase): any;
    export function serialize<T extends object>(obj: T, mapper: ObjectMapperBase): any | any[] {
        if (obj && obj instanceof Array && mapper instanceof ArrayMapper) {
            return serializeArray(obj, mapper);
        }

        let serialized: any = {};
        
        let keys = Reflect.ownKeys(obj);

        for (let key of keys) {
            mapper.set(serialized, key, Reflect.get(obj, key), serialized);
        }

        return serialized;
    }

    export function deserialize<T extends object>(rawObj: any[], mapper: ArrayMapper): T[];
    export function deserialize<T extends object>(rawObj: any, mapper: ObjectMapperBase): T
    export function deserialize<T extends object>(rawObj: any, mapper: ObjectMapperBase): T | T[] {
        if (rawObj && rawObj instanceof Array && mapper instanceof ArrayMapper) {
            return deserializeArray<T>(rawObj, mapper);
        }

        let deserialized: any;

        if (!rawObj) return deserialized;

        deserialized = {};
        
        let mappingKeys = mapper.getMappingKeys();

        for (let key of mappingKeys) {
            let rawKey = mapper.getRawKey(key);
            let converter = mapper.getConverterFor(key);

            if (rawKey) {
                let val: any;
                if (converter && converter instanceof Converter.ImmutableRef) {
                    val = deserialize(Reflect.get(rawObj, rawKey, rawObj), converter.mapper);
                } else {
                    val = mapper.get(rawObj, key, rawObj);
                }

                Reflect.set(deserialized, key, val);
            }
        }

        return deserialized;
    }

    function serializeArray<T extends object>(arr: T[], mapper: ArrayMapper): any {
        let serialized: any[] = [];
        
        let len = arr.length;

        for (let i = 0; i < len; i++) {
            serialized[i] = serialize(arr[i], mapper.ObjectMapper);
        }

        return serialized;
    }

    function deserializeArray<T extends object>(rawObj: any[], mapper: ArrayMapper): T[] {
        let deserialized: any[] = [];
        
        let len = rawObj.length;

        for (let i = 0; i < len; i++) {
            deserialized[i] = deserialize(rawObj[i], mapper.ObjectMapper);
        }

        return deserialized;
    }

}
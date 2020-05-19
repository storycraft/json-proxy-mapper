/*
 * Created on Tue May 19 2020
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

import { ObjectMapper } from "./common";

export namespace Serializer {

    export function serialize<T extends object>(obj: T, mapper: ObjectMapper): any {
        let serialized: any = {};
        
        let keys = Reflect.ownKeys(obj);

        for (let key of keys) {
            mapper.set(serialized, key, Reflect.get(obj, key), serialized);
        }

        return serialized;
    }

    export function deserialize<T extends object>(rawObj: any, mapper: ObjectMapper): T {
        let deserialized: any = {};
        
        let mappingKeys = mapper.getMappingKeys();

        for (let key of mappingKeys) {
            let rawKey = mapper.getRawKey(key);
            let converter = mapper.getConverterFor(key);

            if (rawKey) {
                let val: any;
                if (converter && converter instanceof ObjectMapper) {
                    val = deserialize(Reflect.get(rawObj, rawKey, rawObj), converter);
                } else {
                    val = mapper.get(rawObj, key, rawObj);
                }

                Reflect.set(deserialized, key, val);
            }
        }

        return deserialized;
    }

}
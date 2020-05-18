/*
 * Created on Mon May 18 2020
 *
 * Copyright (c) storycraft. Licensed under the Apache-2.0 Licence.
 */

import { WrappedObject, ObjectMapper, ConvertMap, Converter } from "../src";
import { assert } from "chai";

interface OptionalObj {

    optional: number

}

let optionalMapping = {

    'optional': 'o'

}

const OptionalMap = {

    // default value === 12
    'optional': Converter.setDefault(12)

}

describe('Mapping with default', () => {

    describe('get / set to optional', () => {

        let original: { o?: number } = {};
        let wrapped = new WrappedObject<OptionalObj>(original, new ObjectMapper(optionalMapping, OptionalMap));

        it('get or default', () => {
            assert.equal(wrapped.optional, 12);
        });
    
        it('set', () => {
            let val = Math.floor(Math.random() * 10000);

            wrapped.optional = val;
        
            assert.equal(original.o, val);
        });
    
    });

});
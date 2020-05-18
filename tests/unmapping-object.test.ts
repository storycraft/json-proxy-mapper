/*
 * Created on Mon May 18 2020
 *
 * Copyright (c) storycraft. Licensed under the Apache-2.0 Licence.
 */

import { WrappedObject, ObjectMapper, Converter } from "../src";
import { assert } from "chai";

interface NestedObj {

    text2: string

}

interface TestObj {

    text1: string,
    obj: NestedObj

}

let testMapping = {

    'text1': 't',
    'obj': 'o'

}

let nestedMapping = {

    'text2': 't'

}

const ConvertMap = {

    'obj': new Converter.Object(new ObjectMapper(nestedMapping))

}

it('create wrapper from named object', () => {

    let named: TestObj = { text1: '1234', obj: { text2: '5678' } };
        
    let wrapped = WrappedObject.createFrom(named, new ObjectMapper(testMapping, ConvertMap));

    assert.deepEqual(wrapped.original, { t: '1234', o: { t: '5678' } });

});
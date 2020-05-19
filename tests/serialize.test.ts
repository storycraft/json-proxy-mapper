/*
 * Created on Tue May 19 2020
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

import { ObjectMapper, Serializer, Converter } from "../src/index";
import { assert } from "chai";

interface NestedObj {

    text: string

}

interface TestObj {

    obj: NestedObj

}

let testMapping = {

    'obj': 'o'

}

let nestedMapping = {

    'text': 't'

}

const convertMap = {

    'obj': new Converter.Object(nestedMapping)

}

describe('Manual serialize', () => {

    it('Serialize', () => {

        let deserialized = { obj: { text: 'asdf' } };
        assert.deepEqual(Serializer.serialize(deserialized, new ObjectMapper(testMapping, convertMap)), { 'o': { 't': 'asdf' } });
    
    });

    it('Deserialize', () => {
        let serialized = { o: { t: 'fdsa' } };
        assert.deepEqual(Serializer.deserialize(serialized, new ObjectMapper(testMapping, convertMap)), { obj: { text: 'fdsa' } });
    });

});
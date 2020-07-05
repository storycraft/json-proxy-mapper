/*
 * Created on Sun May 24 2020
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

import { assert } from "chai";
import { ArrayMapper, PartialNamedArray } from "../src/common";
import { WrappedObject, WrappedArray, Converter } from "../src/proxy";
import { Serializer } from "../src/serializer";

interface NestedObj {

    text: string

}

let nestedObjMapping = {

    'text': 't'

}

interface ArrayObj {

    obj: NestedObj[]

}

let objMapping = {

    'obj': 'o'

}

let objConvertMap = {

    obj: new Converter.Array(nestedObjMapping)

}

describe('Array mapping get / set', () => {

    let array = [ { 'o': [ { 't': 'a'} ] } ];
    let mapper = new ArrayMapper(objMapping, objConvertMap);
    let wrapped = new WrappedArray<ArrayObj>(array, mapper);

    it('basic wrapping', () => {
        assert.isTrue(wrapped.named[0].obj[0].text === 'a');
    });

    it('prototype methods redirecting', () => {
        wrapped.original[0].o.push({ 't': 'fdsa' });
        assert.isTrue(wrapped.named[0].obj.length === 2);
        wrapped.original[0].o.pop();
        assert.isTrue(wrapped.named[0].obj.length === 1);
    });

    it('serializing', () => {
        assert.deepEqual(Serializer.serialize<ArrayObj>([ { 'obj': [ { 'text': 'asdf'} ] } ], mapper), [ { o: [ { 't': 'asdf' } ] } ]);
    });

    it('deserializing', () => {
        assert.deepEqual(Serializer.deserialize<ArrayObj>([ { 'o': [ { 't': 'a'} ] } ], mapper), [ { 'obj': [ { 'text': 'a' } ] } ]);
    });

});
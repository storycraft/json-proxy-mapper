/*
 * Created on Sun May 24 2020
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

import { assert } from "chai";
import { ArrayMapper, PartialNamedArray } from "../src/common";
import { WrappedObject, WrappedArray } from "../src/proxy";
import { Serializer } from "../src/serializer";

interface ArrayObj {

    text: string

}

let objMapping = {

    'text': 't'

}

describe('Array mapping get / set', () => {

    let array = [ { 't': 'asdf' } ];
    let mapper = new ArrayMapper(objMapping);
    let wrapped = new WrappedArray<ArrayObj>(array, mapper);

    it('basic wrapping', () => {
        assert.isTrue(wrapped.named[0].text === 'asdf');
    });

    it('prototype methods redirecting', () => {
        wrapped.original.push({ 't': 'fdsa' });
        assert.isTrue(wrapped.named.length === 2);
        wrapped.original.pop();
        assert.isTrue(wrapped.named.length === 1);
    });

    it('serializing', () => {
        assert.deepEqual(Serializer.serialize<ArrayObj>([ { 'text': 'asdf' } ], mapper), [ { 't': 'asdf' } ]);
    });

    it('deserializing', () => {
        assert.deepEqual(Serializer.deserialize<ArrayObj>(array, mapper), [ { 'text': 'asdf' } ]);
    });

});
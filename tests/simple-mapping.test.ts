/*
 * Created on Mon May 18 2020
 *
 * Copyright (c) storycraft. Licensed under the Apache-2.0 Licence.
 */

import { ObjectMapper, WrappedObject } from "../src/index";
import { assert } from "chai";

interface TestObj {

    text: string

}

let testMapping = {

    'text': 't'

}

describe('Named mapping', () => {

    describe('get / set from wrapped', () => {

        let original = { t: 'test1' };
        let wrapped = new WrappedObject<TestObj>(original, new ObjectMapper(testMapping));

        it('get', () => {
            assert.isTrue(wrapped.text === 'test1');
        });
    
        it('set', () => {
            let val = Math.floor(Math.random() * 10000).toString();

            wrapped.text = val;
        
            assert.equal(original.t, val);
        });
    
    });

    describe('set from original', () => {

        let original = { t: 'test2' };
        let wrapped = new WrappedObject<TestObj>(original, new ObjectMapper(testMapping));
    
        it('set', () => {
            let val = Math.floor(Math.random() * 10000).toString();
            
            original.t = val;
        
            assert.equal(wrapped.text, val);
        });
    
    });

});
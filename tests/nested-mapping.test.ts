/*
 * Created on Mon May 18 2020
 *
 * Copyright (c) storycraft. Licensed under the Apache-2.0 Licence.
 */

import { ObjectMapper, WrappedObject, Converter } from "../src/index";
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

const ConvertMap = {

    'obj': new Converter.Object(new ObjectMapper(nestedMapping))

}

describe('Nested mapping get / set', () => {

    describe('changes from wrapped', () => {

        let original = { o: { t: '1234' } };
        let wrapped = new WrappedObject<TestObj>(original, new ObjectMapper(testMapping, ConvertMap));

        it('get', () => {
            assert.isTrue(wrapped.named.obj.text === '1234');
        });
    
        it('set', () => {
            let val = Math.floor(Math.random() * 10000).toString();

            wrapped.named.obj.text = val;
        
            assert.equal(original.o.t, val);
        });
    
    });

    describe('changes from original', () => {

        let original = { o: { t: '5678' } };
        let wrapped = new WrappedObject<TestObj>(original, new ObjectMapper(testMapping, ConvertMap));
    
        it('set', () => {
            let val = Math.floor(Math.random() * 10000).toString();
            
            original.o.t = val;
        
            assert.equal(wrapped.named.obj.text, val);
        });
    
    });

    it('set object from original', () => {
        let original = { o: { t: '5678' } };
        let wrapped = new WrappedObject<TestObj>(original, new ObjectMapper(testMapping, ConvertMap));
    
        let val = Math.floor(Math.random() * 10000).toString();
            
        original.o = { t: val };
        
        assert.equal(wrapped.named.obj.text, val);
    });

    it('set object from wrapped', () => {
        let original = { o: { t: '5678' } };
        let wrapped = new WrappedObject<TestObj>(original, new ObjectMapper(testMapping, ConvertMap));
    
        let val = Math.floor(Math.random() * 10000).toString();
            
        wrapped.named.obj = { text: val };
        
        assert.equal(original.o.t, val);
    });

});
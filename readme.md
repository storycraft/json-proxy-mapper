# JSON Proxy mapper

JSON Proxy mapper provides simple wrapped proxy for json.  
It wraps obfuscated object and provides named object using ES6 Proxy.

## Example

### Simple
parts from simple-mapping.test.ts
```typescript
interface TestObj { // <-- type supports for typescript!

    token: string

}

let testMapping = {

    'token': 't'

}

let wrapped = new WrappedObject<TestObj>({ t: '178231452312' }, new ObjectMapper(testMapping));

console.log(wrapped.named.token === '178231452312'); // true

wrapped.named.token = '172849081972';
console.log(wrapped.original.t === '172849081972'); // true
```
## Nested
parts from nested-mapping.test.ts
```typescript

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

let wrapped = new WrappedObject<TestObj>({ o: { t: '5678' } }, new ObjectMapper(testMapping, ConvertMap));

console.log(wrapped.named.obj.text === '5678'); //true

wrapped.original.o.t = '1234'
console.log(wrapped.named.obj.text === '1234'); //true

wrapped.named.obj.text = '4321'
console.log(wrapped.original.o.t === '4321'); //true

wrapped.named.obj = { text: '1111' }
console.log(wrapped.original.o.t === '1111'); //true

wrapped.original.o = { t: '2222' }
console.log(wrapped.named.obj.text === '2222'); //true

```

## License

json-object-mapper is following Apache 2.0 License.
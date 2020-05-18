# JSON Object mapper

JSON Object mapper provides simple wrapper for json.  
It wraps obfuscated object and provides mapped object using ES6 Proxy.

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

let original = { t: '178231452312' };

let wrapped = new WrappedObject<TestObj>(original, new ObjectMapper(testMapping));

console.log(wrapped.token === '178231452312'); // true

wrapped.token = '172849081972';
console.log(original.t === '172849081972'); // true
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

let original = { o: { t: '5678' } };

let wrapped = new WrappedObject<TestObj>(original, new ObjectMapper(testMapping, ConvertMap));

console.log(wrapped.obj.text === '5678'); //true

original.o.t = '1234'
console.log(wrapped.obj.text === '1234'); //true

wrapped.obj.text = '4321'
console.log(original.o.t === '4321'); //true

wrapped.obj = { text: '1111' }
console.log(original.o.t === '1111'); //true

original.o = { t: '2222' }
console.log(wrapped.obj.text === '2222'); //true

```

## License

json-object-mapper is following Apache 2.0 License.
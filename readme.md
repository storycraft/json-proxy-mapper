# JSON Object mapper

JSON Object mapper provides simple wrapper for json.  
It wraps obfuscated object and provides mapped object using ES6 Proxy.

## Example

### Simple
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

## License

json-object-mapper is following Apache 2.0 License.
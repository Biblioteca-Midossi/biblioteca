# BookResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [default to undefined]
**titolo** | **string** |  | [default to undefined]
**autori** | **Array&lt;string&gt;** |  | [default to undefined]
**coverUrl** | **string** |  | [optional] [default to undefined]
**isbn** | **string** |  | [optional] [default to undefined]
**genere** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**quantita** | **number** |  | [default to undefined]
**casaEditrice** | **string** |  | [optional] [default to undefined]
**descrizione** | **string** |  | [optional] [default to undefined]
**istituto** | [**Istituto**](Istituto.md) |  | [optional] [default to undefined]
**scaffale** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { BookResponse } from './api';

const instance: BookResponse = {
    id,
    titolo,
    autori,
    coverUrl,
    isbn,
    genere,
    quantita,
    casaEditrice,
    descrizione,
    istituto,
    scaffale,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

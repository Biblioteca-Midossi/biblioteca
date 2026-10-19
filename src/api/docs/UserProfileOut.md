# UserProfileOut


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [default to undefined]
**username** | **string** |  | [default to undefined]
**email** | **string** |  | [default to undefined]
**nome** | **string** |  | [default to undefined]
**cognome** | **string** |  | [default to undefined]
**istituto** | [**Istituto**](Istituto.md) |  | [optional] [default to undefined]
**roleId** | **number** |  | [default to undefined]
**roleName** | **string** |  | [optional] [default to '']
**permissions** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**bio** | **string** |  | [optional] [default to undefined]
**profilePicture** | **string** |  | [optional] [default to undefined]
**lastLogin** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { UserProfileOut } from './api';

const instance: UserProfileOut = {
    id,
    username,
    email,
    nome,
    cognome,
    istituto,
    roleId,
    roleName,
    permissions,
    bio,
    profilePicture,
    lastLogin,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

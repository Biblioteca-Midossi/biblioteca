# UsersApi

All URIs are relative to */api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getProfileUsersMeGet**](#getprofileusersmeget) | **GET** /users/me | Get Profile|
|[**getRecentUsersUsersRecentGet**](#getrecentusersusersrecentget) | **GET** /users/recent | Get Recent Users|
|[**getUsersUsersGetUsersGet**](#getusersusersgetusersget) | **GET** /users/get-users | Get Users|
|[**updateProfileUsersMePut**](#updateprofileusersmeput) | **PUT** /users/me | Update Profile|
|[**updateUserUsersUpdateUserUserIdPut**](#updateuserusersupdateuseruseridput) | **PUT** /users/update-user/{user_id} | Update User|

# **getProfileUsersMeGet**
> UserProfileOut getProfileUsersMeGet()


### Example

```typescript
import {
    UsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

const { status, data } = await apiInstance.getProfileUsersMeGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**UserProfileOut**

### Authorization

[AuthXAccessCookie](../README.md#AuthXAccessCookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getRecentUsersUsersRecentGet**
> UsersRecentListResponse getRecentUsersUsersRecentGet()


### Example

```typescript
import {
    UsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let limit: number; // (optional) (default to 5)

const { status, data } = await apiInstance.getRecentUsersUsersRecentGet(
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **limit** | [**number**] |  | (optional) defaults to 5|


### Return type

**UsersRecentListResponse**

### Authorization

[AuthXAccessCookie](../README.md#AuthXAccessCookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**404** | Not found |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUsersUsersGetUsersGet**
> UsersListResponse getUsersUsersGetUsersGet()


### Example

```typescript
import {
    UsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let offset: number; // (optional) (default to 0)
let limit: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getUsersUsersGetUsersGet(
    offset,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **offset** | [**number**] |  | (optional) defaults to 0|
| **limit** | [**number**] |  | (optional) defaults to 10|


### Return type

**UsersListResponse**

### Authorization

[AuthXAccessCookie](../README.md#AuthXAccessCookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**404** | Not found |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateProfileUsersMePut**
> MessageResponse updateProfileUsersMePut()


### Example

```typescript
import {
    UsersApi,
    Configuration,
    UserProfileUpdate
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let profileUpdate: UserProfileUpdate; // (optional) (default to undefined)
let file: File; // (optional) (default to undefined)

const { status, data } = await apiInstance.updateProfileUsersMePut(
    profileUpdate,
    file
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **profileUpdate** | **UserProfileUpdate** |  | (optional) defaults to undefined|
| **file** | [**File**] |  | (optional) defaults to undefined|


### Return type

**MessageResponse**

### Authorization

[AuthXAccessCookie](../README.md#AuthXAccessCookie)

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**404** | Not found |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateUserUsersUpdateUserUserIdPut**
> MessageResponse updateUserUsersUpdateUserUserIdPut()


### Example

```typescript
import {
    UsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let userId: number; // (default to undefined)

const { status, data } = await apiInstance.updateUserUsersUpdateUserUserIdPut(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] |  | defaults to undefined|


### Return type

**MessageResponse**

### Authorization

[AuthXAccessCookie](../README.md#AuthXAccessCookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**404** | Not found |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


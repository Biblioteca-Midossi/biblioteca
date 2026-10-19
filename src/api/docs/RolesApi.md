# RolesApi

All URIs are relative to */api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**listRolesRolesGet**](#listrolesrolesget) | **GET** /roles/ | List Roles|

# **listRolesRolesGet**
> Array<RoleOut> listRolesRolesGet()

List all roles with their permissions. Requires view_users permission.

### Example

```typescript
import {
    RolesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RolesApi(configuration);

const { status, data } = await apiInstance.listRolesRolesGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<RoleOut>**

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


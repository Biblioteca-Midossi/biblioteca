# BooksApi

All URIs are relative to */api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createBookBooksPost**](#createbookbookspost) | **POST** /books/ | Create Book|
|[**deleteBookBooksBookIdDelete**](#deletebookbooksbookiddelete) | **DELETE** /books/{book_id} | Delete Book|
|[**getBookBooksBookIdGet**](#getbookbooksbookidget) | **GET** /books/{book_id} | Get Book|
|[**getBooksBooksGet**](#getbooksbooksget) | **GET** /books/ | Get Books|
|[**getRecentBooksBooksRecentGet**](#getrecentbooksbooksrecentget) | **GET** /books/recent | Get Recent Books|
|[**updateBookBooksBookIdPut**](#updatebookbooksbookidput) | **PUT** /books/{book_id} | Update Book|

# **createBookBooksPost**
> any createBookBooksPost()


### Example

```typescript
import {
    BooksApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BooksApi(configuration);

let thumbnail: File; // (optional) (default to undefined)

const { status, data } = await apiInstance.createBookBooksPost(
    thumbnail
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **thumbnail** | [**File**] |  | (optional) defaults to undefined|


### Return type

**any**

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

# **deleteBookBooksBookIdDelete**
> MessageResponse deleteBookBooksBookIdDelete()


### Example

```typescript
import {
    BooksApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BooksApi(configuration);

let bookId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteBookBooksBookIdDelete(
    bookId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **bookId** | [**number**] |  | defaults to undefined|


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

# **getBookBooksBookIdGet**
> BookDetailResponse getBookBooksBookIdGet()


### Example

```typescript
import {
    BooksApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BooksApi(configuration);

let bookId: number; // (default to undefined)

const { status, data } = await apiInstance.getBookBooksBookIdGet(
    bookId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **bookId** | [**number**] |  | defaults to undefined|


### Return type

**BookDetailResponse**

### Authorization

No authorization required

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

# **getBooksBooksGet**
> BooksListResponse getBooksBooksGet()


### Example

```typescript
import {
    BooksApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BooksApi(configuration);

let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 12)
let search: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getBooksBooksGet(
    page,
    limit,
    search
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 1|
| **limit** | [**number**] |  | (optional) defaults to 12|
| **search** | [**string**] |  | (optional) defaults to undefined|


### Return type

**BooksListResponse**

### Authorization

No authorization required

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

# **getRecentBooksBooksRecentGet**
> RecentBooksListResponse getRecentBooksBooksRecentGet()

Return the most recently added books by picking the highest id_libro values. The result is ordered by id_libro desc and limited by `limit`.

### Example

```typescript
import {
    BooksApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BooksApi(configuration);

let limit: number; // (optional) (default to 5)

const { status, data } = await apiInstance.getRecentBooksBooksRecentGet(
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **limit** | [**number**] |  | (optional) defaults to 5|


### Return type

**RecentBooksListResponse**

### Authorization

No authorization required

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

# **updateBookBooksBookIdPut**
> MessageResponse updateBookBooksBookIdPut()


### Example

```typescript
import {
    BooksApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BooksApi(configuration);

let bookId: number; // (default to undefined)
let file: File; // (optional) (default to undefined)

const { status, data } = await apiInstance.updateBookBooksBookIdPut(
    bookId,
    file
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **bookId** | [**number**] |  | defaults to undefined|
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


# Bara API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Response Model](#response-model)
3. [Models / Entities](#models--entities)
4. [Authentication & Authorization](#authentication--authorization)
5. [Authentication Endpoints](#authentication-endpoints)
6. [User Management Endpoints](#user-management-endpoints)
7. [Producer Endpoints](#producer-endpoints)
8. [Writer Endpoints](#writer-endpoints)
9. [Script Endpoints](#script-endpoints)
10. [Script Transaction Endpoints](#script-transaction-endpoints)
11. [Transaction Endpoints](#transaction-endpoints)
12. [Utility Endpoints](#utility-endpoints)
13. [Health Check Endpoints](#health-check-endpoints)

## Overview

This documentation gives an overview of the bara-api and how to work with it
**Base URL:** `https://bara-y51u.onrender.com`

<!-- **API Version:** v1 -->

## Response Model

All API responses follow a consistent structure using the `ResponseDetail<T>` wrapper:

### ResponseDetail<T> Properties

| Property     | Type    | Description                                  |
| ------------ | ------- | -------------------------------------------- |
| `IsSuccess`  | boolean | Indicates if the operation was successful    |
| `Message`    | string  | Human-readable message describing the result |
| `Data`       | T       | The actual response data (null on failure)   |
| `StatusCode` | integer | HTTP status code                             |
| `Error`      | string  | Error details (only present on failure)      |
| `TotalCount` | integer | Total number of items (pagination only)      |
| `TotalPages` | integer | Total number of pages (pagination only)      |
| `PageNumber` | integer | Current page number (pagination only)        |

### Success Response Example

```json
{
  "isSuccess": true,
  "message": "Operation completed successfully",
  "data": {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com"
  },
  "statusCode": 200
}
```

### Error Response Example

```json
{
  "isSuccess": false,
  "message": "Validation failed",
  "data": null,
  "statusCode": 400,
  "error": "Email is required"
}
```

### Paginated Response Example

```json
{
  "isSuccess": true,
  "message": "Scripts retrieved successfully",
  "data": [...],
  "statusCode": 200,
  "totalCount": 150,
  "totalPages": 15,
  "pageNumber": 1
}
```

## Models / Entities

This section describes all database models and enums used throughout the API.

#### User Model

**Description:** Core user entity capturing identity, profile, verification, and relationships.

| Property             | Type                    | Required | Max Length | Description                       |
| -------------------- | ----------------------- | -------- | ---------- | --------------------------------- |
| `Id`                 | Guid                    | Yes      | -          | Unique identifier                 |
| `FirstName`          | string                  | Yes      | 60         | User's first name                 |
| `LastName`           | string                  | Yes      | 60         | User's last name                  |
| `MiddleName`         | string                  | No       | 60         | User's middle name                |
| `Email`              | string                  | Yes      | -          | User's email address              |
| `PhoneNumber`        | string                  | Yes      | 15         | User's phone number               |
| `DateOfBirth`        | DateOnly                | Yes      | -          | User's date of birth              |
| `Gender`             | Gender enum             | Yes      | -          | User's gender                     |
| `IsBlacklisted`      | boolean                 | No       | -          | Whether user is blacklisted       |
| `IsDeleted`          | boolean                 | No       | -          | Whether user is deleted           |
| `VerificationStatus` | VerificationStatus enum | No       | -          | Current verification status       |
| `Type`               | Role enum               | Yes      | -          | User type (Writer/Producer/Admin) |

**Relationships:**

- Has one `Address` (required)
- Has one `AuthProfile` (required)
- Has one `Document` (required)
- Has one `Wallet` (required)
- Has many `BankDetails`
- Has many `PaymentDetails`
- Has many `PaymentTransactions`

#### Writer Model

**Description:** Specialized user type for script writers, extends User model.

| Property          | Type    | Required | Max Length | Description               |
| ----------------- | ------- | -------- | ---------- | ------------------------- |
| `Bio`             | string  | No       | 200        | Writer's biography        |
| `IsPremiumMember` | boolean | No       | -          | Premium membership status |

**Relationships:**

- Inherits all User relationships
- Has many `BioExperience`
- Has many `Service`
- Has many `Script`

#### Producer Model

**Description:** Specialized user type for script producers, extends User model.

**Relationships:**

- Inherits all User relationships
- Has many `PurchasedScripts` (Script collection)

#### Script Model

**Description:** Script entity containing metadata and publishing details.

| Property             | Type              | Required | Max Length | Description                   |
| -------------------- | ----------------- | -------- | ---------- | ----------------------------- |
| `Id`                 | Guid              | Yes      | -          | Unique identifier             |
| `Title`              | string            | Yes      | 200        | Script title                  |
| `Genre`              | string            | Yes      | 30         | Script genre                  |
| `Logline`            | string            | Yes      | -          | One-line story pitch          |
| `Synopsis`           | string            | Yes      | -          | Detailed story overview       |
| `Price`              | decimal           | Yes      | -          | Script purchase price         |
| `Path`               | string            | Yes      | -          | Internal file storage path    |
| `Url`                | string            | Yes      | -          | Public file URL               |
| `UploadedOn`         | DateTimeOffset    | No       | -          | Upload timestamp              |
| `Currency`           | Currency enum     | No       | -          | Price currency                |
| `IsScriptRegistered` | boolean           | No       | -          | Registration status           |
| `RegistrationBody`   | string            | No       | -          | Registration organization     |
| `Image`              | string            | No       | -          | Cover image URL               |
| `CopyrightNumber`    | string            | No       | -          | Copyright registration number |
| `OwnershipRights`    | IPDealType enum   | No       | -          | IP ownership type             |
| `ProofUrl`           | string            | No       | -          | Ownership proof document URL  |
| `WriterId`           | Guid              | No       | -          | Foreign key to Writer         |
| `WriterName`         | string            | Yes      | -          | Writer's full name            |
| `Status`             | ScriptStatus enum | No       | -          | Current script status         |

**Relationships:**

- Belongs to one `Writer`
- May belong to one `Producer` (when purchased)

#### AuthProfile Model

**Description:** Authentication profile containing credentials and login history.

| Property                 | Type           | Required | Description               |
| ------------------------ | -------------- | -------- | ------------------------- |
| `Id`                     | Guid           | Yes      | Unique identifier         |
| `FullName`               | string         | No       | User's display name       |
| `Email`                  | string         | Yes      | Login email address       |
| `Password`               | string         | Yes      | Hashed password           |
| `IsLocked`               | boolean        | No       | Account lock status       |
| `IsVerified`             | boolean        | No       | Full verification status  |
| `IsEmailVerified`        | boolean        | No       | Email verification status |
| `IsProfileSetupComplete` | boolean        | No       | Profile completion status |
| `LastLoginDevice`        | string         | No       | Recent login device       |
| `LastLoginIPAddress`     | string         | No       | Recent login IP           |
| `LoginAttempts`          | integer        | No       | Failed login count        |
| `Role`                   | string         | No       | User role                 |
| `LastLoginAt`            | DateTimeOffset | No       | Last successful login     |

#### Wallet Model

**Description:** Digital wallet for user transactions.

| Property           | Type          | Required | Description                |
| ------------------ | ------------- | -------- | -------------------------- |
| `Id`               | Guid          | Yes      | Unique identifier          |
| `TotalBalance`     | decimal       | No       | Total wallet balance       |
| `LockedBalance`    | decimal       | No       | Locked/escrowed funds      |
| `AvailableBalance` | decimal       | No       | Available for spending     |
| `Currency`         | Currency enum | No       | Wallet currency            |
| `CurrencySymbol`   | string        | No       | Currency symbol (computed) |
| `UserId`           | Guid          | Yes      | Foreign key to User        |

**Relationships:**

- Belongs to one `User`
- Has many `PaymentTransaction`

#### Address Model

**Description:** Physical address information for users.

| Property                 | Type   | Required | Description                       |
| ------------------------ | ------ | -------- | --------------------------------- |
| `Id`                     | Guid   | Yes      | Unique identifier                 |
| `Street`                 | string | Yes      | Street address                    |
| `City`                   | string | Yes      | City name                         |
| `State`                  | string | Yes      | State/province                    |
| `Country`                | string | Yes      | Country name                      |
| `PostalCode`             | string | No       | Postal/ZIP code                   |
| `AdditionalDetails`      | string | No       | Additional address details        |
| `ProofOfAddressDocument` | string | No       | Address verification document URL |
| `UserId`                 | Guid   | Yes      | Foreign key to User               |

**Relationships:**

- Belongs to one `User` (required)

#### Document Model

**Description:** Verification documents submitted by users for identity verification.

| Property               | Type              | Required | Description             |
| ---------------------- | ----------------- | -------- | ----------------------- |
| `Id`                   | Guid              | Yes      | Unique identifier       |
| `IdentificationNumber` | string            | Yes      | ID number from document |
| `DocumentType`         | DocumentType enum | Yes      | Type of document        |
| `IsVerified`           | boolean           | No       | Verification status     |
| `DocumentUrl`          | string            | No       | Public document URL     |
| `Name`                 | string            | Yes      | Original filename       |
| `Path`                 | string            | Yes      | Internal storage path   |
| `FileExtension`        | string            | No       | File extension          |
| `UserId`               | Guid              | Yes      | Foreign key to User     |

**Relationships:**

- Belongs to one `User` (required)

#### Service Model

**Description:** Services offered by writers (editing, proofreading, etc.).

| Property          | Type             | Required | Max Length | Description              |
| ----------------- | ---------------- | -------- | ---------- | ------------------------ |
| `Id`              | Guid             | Yes      | -          | Unique identifier        |
| `Name`            | string           | Yes      | 60         | Service name             |
| `Description`     | string           | Yes      | 200        | Service description      |
| `MinPrice`        | decimal          | Yes      | -          | Minimum price            |
| `MaxPrice`        | decimal          | Yes      | -          | Maximum price            |
| `Currency`        | Currency enum    | No       | -          | Price currency           |
| `IPDealType`      | IPDealType enum  | No       | -          | IP ownership terms       |
| `SharePercentage` | decimal          | No       | -          | Revenue share percentage |
| `PaymentType`     | PaymentType enum | No       | -          | Payment structure        |
| `Genre`           | string           | No       | -          | Applicable genre         |
| `WriterId`        | Guid             | Yes      | -          | Foreign key to Writer    |

**Relationships:**

- Belongs to one `Writer`

#### BioExperience Model

**Description:** Professional experience entries for writers.

| Property       | Type     | Required | Description                |
| -------------- | -------- | -------- | -------------------------- |
| `Id`           | Guid     | Yes      | Unique identifier          |
| `Description`  | string   | Yes      | Experience description     |
| `Organization` | string   | No       | Organization name          |
| `Project`      | string   | No       | Project name               |
| `StartDate`    | DateOnly | Yes      | Start date                 |
| `EndDate`      | DateOnly | No       | End date (null if current) |
| `IsCurrent`    | boolean  | No       | Whether currently active   |
| `WriterId`     | Guid     | Yes      | Foreign key to Writer      |

**Relationships:**

- Belongs to one `Writer`

#### ScriptTransaction Model

**Description:** Financial transaction for script purchases between producers and writers.

| Property            | Type                         | Required | Description                  |
| ------------------- | ---------------------------- | -------- | ---------------------------- |
| `Id`                | Guid                         | Yes      | Unique identifier            |
| `ScriptId`          | Guid                         | Yes      | Foreign key to Script        |
| `ScriptTitle`       | string                       | No       | Script title (denormalized)  |
| `ProducerId`        | Guid                         | Yes      | Foreign key to Producer      |
| `ProducerName`      | string                       | No       | Producer name (denormalized) |
| `WriterId`          | Guid                         | Yes      | Foreign key to Writer        |
| `WriterName`        | string                       | No       | Writer name (denormalized)   |
| `Amount`            | decimal                      | Yes      | Total transaction amount     |
| `PlatformFee`       | decimal                      | Yes      | Platform commission          |
| `WriterShare`       | decimal                      | Yes      | Writer's share (90%)         |
| `Currency`          | Currency enum                | No       | Transaction currency         |
| `Status`            | ScriptDeliveryStatus enum    | No       | Delivery status              |
| `TransactionStatus` | ScriptTransactionStatus enum | No       | Transaction status           |
| `IdempotencyKey`    | string                       | Yes      | Unique transaction key       |
| `WriterPaidAt`      | DateTimeOffset               | No       | Writer payment timestamp     |

**Relationships:**

- Belongs to one `Script`
- Belongs to one `Producer`
- Belongs to one `Writer`
- May have one `Chat`

#### PaymentTransaction Model

**Description:** General payment transactions for wallet funding and other operations.

| Property          | Type                   | Required | Description                |
| ----------------- | ---------------------- | -------- | -------------------------- |
| `Id`              | Guid                   | Yes      | Unique identifier          |
| `UserId`          | Guid                   | Yes      | Foreign key to User        |
| `UserFullName`    | string                 | No       | User name (denormalized)   |
| `Amount`          | decimal                | Yes      | Transaction amount         |
| `Fee`             | decimal                | Yes      | Transaction fee            |
| `Currency`        | Currency enum          | No       | Transaction currency       |
| `CurrencySymbol`  | string                 | No       | Currency symbol (computed) |
| `Status`          | TransactionStatus enum | No       | Transaction status         |
| `Type`            | TransactionType enum   | No       | Transaction type           |
| `ReferenceId`     | string                 | No       | External reference ID      |
| `Notes`           | string                 | No       | Transaction notes          |
| `GatewayResponse` | string                 | No       | Payment gateway response   |
| `AccessCode`      | string                 | No       | Payment access code        |
| `TransferCode`    | string                 | No       | Transfer code              |

**Relationships:**

- Belongs to one `User`
- Belongs to one `Wallet`

#### PaymentDetail Model

**Description:** Stored payment method details for users.

| Property            | Type    | Required | Description                        |
| ------------------- | ------- | -------- | ---------------------------------- |
| `Id`                | Guid    | Yes      | Unique identifier                  |
| `CustomerId`        | string  | No       | Payment provider customer ID       |
| `CustomerCode`      | string  | No       | Payment provider customer code     |
| `AuthorizationCode` | string  | No       | Payment authorization code         |
| `CardType`          | string  | No       | Card type (Visa, Mastercard, etc.) |
| `Last4`             | string  | No       | Last 4 digits of card              |
| `CountryCode`       | string  | No       | Card country code                  |
| `Bank`              | string  | No       | Issuing bank                       |
| `ExpMonth`          | string  | No       | Expiration month                   |
| `ExpYear`           | string  | No       | Expiration year                    |
| `Reusable`          | boolean | No       | Whether card can be reused         |
| `UserId`            | Guid    | Yes      | Foreign key to User                |

**Relationships:**

- Belongs to one `User`

#### BankDetail Model

**Description:** Bank account information for user withdrawals.

| Property        | Type   | Required | Max Length | Description         |
| --------------- | ------ | -------- | ---------- | ------------------- |
| `Id`            | Guid   | Yes      | -          | Unique identifier   |
| `UserId`        | Guid   | Yes      | -          | Foreign key to User |
| `AccountNumber` | string | Yes      | 60         | Bank account number |
| `AccountName`   | string | Yes      | 100        | Account holder name |
| `BankName`      | string | Yes      | 60         | Bank name           |
| `BankCode`      | string | Yes      | 20         | Bank code           |
| `BankId`        | string | Yes      | -          | Bank identifier     |
| `BankType`      | string | Yes      | -          | Bank type           |

**Relationships:**

- Belongs to one `User`

#### BlackListedUser Model

**Description:** Records of users who have been blacklisted from the platform.

| Property        | Type           | Required | Description                       |
| --------------- | -------------- | -------- | --------------------------------- |
| `Id`            | Guid           | Yes      | Unique identifier                 |
| `UserId`        | Guid           | Yes      | Foreign key to User               |
| `Name`          | string         | Yes      | User name at time of blacklisting |
| `Reason`        | string         | No       | Reason for blacklisting           |
| `BlackListedAt` | DateTimeOffset | No       | Blacklist timestamp               |

**Relationships:**

- Belongs to one `User`

#### Chat

**Description:** Chat conversations between producers and writers for script transactions.

## Endpoints

### 1. Create Chat

**Endpoint:** `POST /api/v1/chats`

**Authentication:** Required (Bearer Token)

**Description:** Creates a new chat for a script transaction between a producer and writer.

**Request Body:**
```json
{
  "scriptId": "550e8400-e29b-41d4-a716-446655440000",
  "scriptTitle": "The Great Adventure",
  "producerId": "660e8400-e29b-41d4-a716-446655440000",
  "producerName": "John Producer",
  "writerId": "770e8400-e29b-41d4-a716-446655440000",
  "writerName": "Jane Writer"
}
```

**Response (Success - 201):**
```json
{
  "isSuccess": true,
  "message": "Chat created successfully",
  "data": "880e8400-e29b-41d4-a716-446655440000",
  "statusCode": 201
}
```

**Response (Error - 400):**
```json
{
  "isSuccess": false,
  "message": "Request body cannot be empty",
  "statusCode": 400,
  "error": "BadRequest"
}
```

---

### 2. Send Message

**Endpoint:** `POST /api/v1/chats/{chatId}/messages`

**Authentication:** Required (Bearer Token)

**Description:** Sends a message in a script transaction chat. The sender is determined from the authenticated user.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `chatId`  | Guid | The ID of the chat |

**Request Body:**
```json
{
  "content": "This is a message about the script revisions.",
  "attachmentUrl": "https://example.com/document.pdf"
}
```

**Content Constraints:**
- `content`: Required, 1-5000 characters
- `attachmentUrl`: Optional, must be valid HTTP/HTTPS URL, max 2048 characters

**Response (Success - 200):**
```json
{
  "isSuccess": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "990e8400-e29b-41d4-a716-446655440000",
    "senderId": "660e8400-e29b-41d4-a716-446655440000",
    "senderName": "John Producer",
    "content": "This is a message about the script revisions.",
    "attachmentUrl": "https://example.com/document.pdf",
    "sentAt": "2024-01-15T10:30:00Z",
    "isRead": false
  },
  "statusCode": 200
}
```

**Response (Rate Limited - 429):**
```json
{
  "isSuccess": false,
  "message": "Too many messages. Please wait before sending another.",
  "statusCode": 429,
  "error": "TooManyRequests"
}
```

**Response (Access Denied - 403):**
```json
{
  "isSuccess": false,
  "message": "Access denied to this chat",
  "statusCode": 403,
  "error": "Forbidden"
}
```

**Response (Chat Closed - 400):**
```json
{
  "isSuccess": false,
  "message": "Cannot send messages to a closed chat",
  "statusCode": 400,
  "error": "BadRequest"
}
```

---

### 3. Get Chat History

**Endpoint:** `GET /api/v1/chats/{chatId}/messages`

**Authentication:** Required (Bearer Token)

**Description:** Retrieves paginated chat history for the authenticated user. Messages are automatically marked as read.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `chatId`  | Guid | The ID of the chat |

**Query Parameters:**

| Parameter  | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `page`    | int  | 1       | No       | Page number (must be > 0) |
| `pageSize`| int  | 20      | No       | Items per page (1-100) |

**Example Request:**
```
GET /api/v1/chats/550e8400-e29b-41d4-a716-446655440000/messages?page=1&pageSize=20
```

**Response (Success - 200):**
```json
{
  "isSuccess": true,
  "message": "Chat history retrieved successfully",
  "data": [
    {
      "messageId": "990e8400-e29b-41d4-a716-446655440000",
      "senderId": "660e8400-e29b-41d4-a716-446655440000",
      "senderName": "John Producer",
      "content": "What are your thoughts on this script?",
      "attachmentUrl": null,
      "sentAt": "2024-01-15T09:00:00Z",
      "isRead": true
    },
    {
      "messageId": "aa0e8400-e29b-41d4-a716-446655440000",
      "senderId": "770e8400-e29b-41d4-a716-446655440000",
      "senderName": "Jane Writer",
      "content": "I think it needs some revisions in Act 2.",
      "attachmentUrl": "https://example.com/revisions.pdf",
      "sentAt": "2024-01-15T10:00:00Z",
      "isRead": true
    }
  ],
  "statusCode": 200,
  "totalCount": 25,
  "totalPages": 2,
  "pageNumber": 1
}
```

**Response (Access Denied - 403):**
```json
{
  "isSuccess": false,
  "message": "Access denied to this chat",
  "statusCode": 403,
  "error": "Forbidden"
}
```

---

### 4. Mark Messages as Read

**Endpoint:** `PATCH /api/v1/chats/{chatId}/messages/mark-read`

**Authentication:** Required (Bearer Token)

**Description:** Marks all unread messages in a chat as read for the authenticated user. Notifies the other participant.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `chatId`  | Guid | The ID of the chat |

**Request Body:** Empty (no body required)

**Response (Success - 200):**
```json
{
  "isSuccess": true,
  "message": "5 messages marked as read",
  "data": true,
  "statusCode": 200
}
```

**Response (Access Denied - 403):**
```json
{
  "isSuccess": false,
  "message": "Access denied to this chat",
  "statusCode": 403,
  "error": "Forbidden"
}
```

---

### 5. Close Chat

**Endpoint:** `PATCH /api/v1/chats/{chatId}/close`

**Authentication:** Required (Bearer Token)

**Description:** Closes a chat when a script transaction is completed or cancelled. Both participants are notified via SignalR.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `chatId`  | Guid | The ID of the chat |

**Request Body:** Empty (no body required)

**Response (Success - 200):**
```json
{
  "isSuccess": true,
  "message": "Chat closed successfully",
  "data": true,
  "statusCode": 200
}
```

**Response (Chat Not Found - 404):**
```json
{
  "isSuccess": false,
  "message": "Chat not found",
  "statusCode": 404,
  "error": "NotFound"
}
```

---

## Models

### Chat Model

**Description:** Chat conversations between producers and writers for script transactions.

| Property       | Type   | Required | Max Length | Description                  |
|---|---|---|---|---|
| `Id`           | Guid   | Yes      | -          | Unique identifier            |
| `ScriptId`     | Guid   | Yes      | -          | Foreign key to Script        |
| `ScriptTitle`  | string | Yes      | 500        | Script title (denormalized)  |
| `ProducerId`   | Guid   | Yes      | -          | Foreign key to Producer      |
| `ProducerName` | string | Yes      | 255        | Producer name (denormalized) |
| `WriterId`     | Guid   | Yes      | -          | Foreign key to Writer        |
| `WriterName`   | string | Yes      | 255        | Writer name (denormalized)   |
| `IsClosed`     | bool   | Yes      | -          | Whether chat is closed       |
| `CreatedAt`    | DateTimeOffset | Yes | -          | Chat creation timestamp      |

---

### ChatMessage Model

**Description:** Individual messages within chat conversations.

| Property        | Type           | Required | Max Length | Description                   |
|---|---|---|---|---|
| `Id`            | Guid           | Yes      | -          | Unique identifier             |
| `ChatId`        | Guid           | Yes      | -          | Foreign key to Chat           |
| `UserId`        | Guid           | Yes      | -          | User ID (sender)              |
| `SenderName`    | string         | Yes      | 255        | Sender name (denormalized)    |
| `Content`       | string         | Yes      | 5000       | Message content (HTML-encoded)|
| `AttachmentUrl` | string         | No       | 2048       | Optional file attachment URL  |
| `SentAt`        | DateTimeOffset | Yes      | -          | Message timestamp             |
| `IsRead`        | bool           | Yes      | -          | Whether message has been read |

---

## Error Codes

| Status Code | Error | Description |
|---|---|---|
| 400 | BadRequest | Invalid request or chat is closed |
| 403 | Forbidden | User does not have access to this chat |
| 404 | NotFound | Chat or resource not found |
| 429 | TooManyRequests | Rate limit exceeded (10 messages/minute) |
| 500 | InternalServerError | Server error occurred |

---

## SignalR Events

### Client Events (Receive)

**MessageReceived**

```javascript
hubConnection.on("MessageReceived", (data) => {
  console.log(data.ChatId);
  console.log(data.Message);
  console.log(data.ScriptTitle);
});
```

**MessagesRead**

```javascript
hubConnection.on("MessagesRead", (data) => {
  console.log(data.ChatId);
  console.log(data.ReadByUserId);
  console.log(data.MarkedCount);
});
```

**ChatClosed**

```javascript
hubConnection.on("ChatClosed", (data) => {
  console.log(data.ChatId);
  console.log(data.ScriptTitle);
  console.log(data.ClosedAt);
});
```

---

## Rate Limiting

- **Limit:** 10 messages per minute per user per chat
- **Status Code:** 429 (Too Many Requests)
- **Response:** `"Too many messages. Please wait before sending another."`
- **Reset:** Automatic after 1 minute
- 
#### VerificationStatus

**Description:** User verification document status.

| Value      | Description           |
| ---------- | --------------------- |
| `Pending`  | Verification pending  |
| `Approved` | Verification approved |
| `Rejected` | Verification rejected |
| `Failed`   | Verification failed   |

#### Role

**Description:** User roles in the system.

| Value      | Description          |
| ---------- | -------------------- |
| `Writer`   | Script writer        |
| `Producer` | Script producer      |
| `Admin`    | System administrator |

#### ScriptStatus

**Description:** Script availability status.

| Value           | Description                |
| --------------- | -------------------------- |
| `Available`     | Available for purchase     |
| `InNegotiation` | Currently being negotiated |
| `Sold`          | Already sold               |
| `Deleted`       | Deleted/removed            |

#### Currency

**Description:** Supported currencies.

| Value   | Description            |
| ------- | ---------------------- |
| `USD`   | United States Dollar   |
| `EUR`   | Euro                   |
| `GBP`   | British Pound Sterling |
| `NAIRA` | Nigerian Naira         |

#### TransactionStatus

**Description:** Payment transaction status.

| Value       | Description            |
| ----------- | ---------------------- |
| `Initiated` | Transaction started    |
| `Pending`   | Awaiting completion    |
| `Completed` | Successfully completed |
| `Failed`    | Transaction failed     |
| `Cancelled` | User cancelled         |
| `Abandoned` | User abandoned         |
| `Escrowed`  | Funds held in escrow   |
| `Refunded`  | Funds refunded         |

#### TransactionType

**Description:** Types of financial transactions.

| Value                        | Description             |
| ---------------------------- | ----------------------- |
| `ScriptPurchase`             | Script purchase payment |
| `ServicePayment`             | Service payment         |
| `Refund`                     | Transaction refund      |
| `Commission`                 | System commission       |
| `WalletFunding`              | Wallet funding          |
| `WalletRelease`              | Wallet fund release     |
| `Withdrawal`                 | Fund withdrawal         |
| `PremiumSubscriptionPayment` | Premium subscription    |
| `ScriptEscrow`               | Escrowed script payment |

#### Gender

**Description:** User gender options.

| Value          | Description       |
| -------------- | ----------------- |
| `UNDECIDED`    | Not specified     |
| `MALE`         | Male              |
| `FEMALE`       | Female            |
| `RATHERNOTSAY` | Prefer not to say |

#### IPDealType

**Description:** Intellectual property deal types.

| Value                   | Description                   |
| ----------------------- | ----------------------------- |
| `WriterRetainsRights`   | Writer keeps all rights       |
| `ProducerRetainsRights` | Producer gets all rights      |
| `SharedRights`          | Rights shared between parties |

#### DocumentType

**Description:** Types of documents accepted for user verification.

| Value | Description |
|-------|-------------|
| `BVN` | Bank Verification Number |
| `International_Passport` | International passport |
| `NIN` | National Identification Number |
| `Drivers_License` | Driver's license |

#### PaymentType

**Description:** Payment structure types for writer services.

| Value | Description |
|-------|-------------|
| `Per_Day` | Payment per day |
| `Per_Week` | Payment per week |
| `Per_Month` | Payment per month |
| `Per_Project` | Payment per project |
| `Per_Word` | Payment per word |
| `Per_Page` | Payment per page |
| `Per_Hour` | Payment per hour |

#### ScriptDeliveryStatus

**Description:** Delivery status of scripts in transactions.

| Value | Description |
|-------|-------------|
| `Cancelled` | Script delivery cancelled |
| `InProgress` | Script delivery in progress |
| `Completed` | Script delivery completed |

#### ScriptTransactionStatus

**Description:** Status of script transactions between producers and writers.

| Value | Description |
|-------|-------------|
| `Initiated` | Transaction initiated, funds escrowed |
| `Completed` | Transaction completed, funds released to writer |
| `Cancelled` | Transaction cancelled, funds refunded to producer |

## Authentication & Authorization

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authorization Policies

- **Admin**: Full system access
- **Producer**: Can purchase scripts, manage profile, access transactions
- **Writer**: Can create/manage scripts, manage profile, access transactions
- **VerifiedOnly**: Requires email verification for sensitive operations

### JWT Token Structure

The JWT token contains:

- `userId`: User's unique identifier
- `email`: User's email address
- `role`: User's role (Admin, Producer, Writer)
- `exp`: Token expiration timestamp

## Authentication Endpoints

**Database Models Affected:** User, AuthProfile, LoginAttempt

### 1. User Login

**Purpose:** Authenticates a user and initiates the login process. Returns user details and may require additional verification.

**URL:** `/api/auth/login`
**Method:** `POST`
**Authorization:** None required

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "loginDevice": "Chrome on Windows 10"
}
```

**Request Model - AuthRequestDTO:**
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `Email` | string | Yes | User's email address |
| `Password` | string | Yes | User's password (plain text) |
| `LoginDevice` | string | Yes | Device/browser information |

**Response Model - LoginResponseDTO:**
| Property | Type | Description |
|----------|------|-------------|
| `UserId` | Guid | User's unique identifier |
| `Name` | string | User's full name |
| `Email` | string | User's email address |
| `WrongLoginAttempts` | integer | Number of failed login attempts |
| `AccessToken` | string | JWT token (may be null if verification required) |
| `IsProfileSetupComplete` | boolean | Whether user has completed profile setup |
| `Role` | string | User's role (Writer, Producer, Admin) |

**Sample cURL Request:**

```bash
curl -X POST "https://api.bara.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "writer@example.com",
    "password": "SecurePassword123!",
    "loginDevice": "Chrome on Windows 10"
  }'
```

**Sample React Fetch:**

```javascript
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "writer@example.com",
    password: "SecurePassword123!",
    loginDevice: "Chrome on Windows 10",
  }),
});
const result = await response.json();
```

**Sample Success Response:**

```json
{
  "isSuccess": true,
  "message": "Login initiated successfully",
  "data": {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "writer@example.com",
    "wrongLoginAttempts": 0,
    "accessToken": null,
    "isProfileSetupComplete": true,
    "role": "Writer"
  },
  "statusCode": 200
}
```

**Sample Error Response:**

```json
{
  "isSuccess": false,
  "message": "Incorrect Email or password",
  "data": null,
  "statusCode": 400
}
```

### 2. Verify Login

**Purpose:** Completes the login process using a verification token sent to the user's email.

**URL:** `/api/auth/verify-login`
**Method:** `PUT`
**Authorization:** None required

**Request Body:**

```json
{
  "email": "user@example.com",
  "token": "123456",
  "device": "Chrome on Windows 10"
}
```

**Request Model - LoginVerificationDTO:**
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `Email` | string | Yes | User's email address |
| `Token` | string | Yes | Verification token from email |
| `Device` | string | Yes | Device/browser information |

**Response:** Same as login endpoint but with `AccessToken` populated on success.

**Sample cURL Request:**

```bash
curl -X PUT "https://api.bara.com/api/auth/verify-login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "writer@example.com",
    "token": "123456",
    "device": "Chrome on Windows 10"
  }'
```

### 3. Verify Email

**Purpose:** Verifies a user's email address using a verification token.

**URL:** `/api/auth/verify-email/{email}/{token}`
**Method:** `PUT`
**Authorization:** None required

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | User's email address |
| `token` | string | Yes | Email verification token |

**Sample cURL Request:**

```bash
curl -X PUT "https://api.bara.com/api/auth/verify-email/user@example.com/abc123token"
```

**Sample Success Response:**

```json
{
  "isSuccess": true,
  "message": "Email verified successfully",
  "data": null,
  "statusCode": 200
}
```

## User Management Endpoints

**Database Models Affected:** User, AuthProfile, Wallet, BankDetail

### 4. Register User

**Purpose:** Registers a new user (Writer or Producer) on the platform.

**URL:** `/api/user/register`
**Method:** `POST`
**Authorization:** None required

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "type": "Writer"
}
```

**Request Model - RegisterDTO:**
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `Email` | string | Yes | User's email address |
| `Password` | string | Yes | Password (min 8 chars, mixed case, numbers, special chars) |
| `Type` | Role enum | Yes | User type: Writer, Producer, or Admin |

**Response Model - RegisterResponseDTO:**
| Property | Type | Description |
|----------|------|-------------|
| `UserId` | Guid | New user's unique identifier |
| `Email` | string | User's email address |
| `AccessToken` | string | JWT token for immediate login |
| `Role` | string | User's assigned role |

**Sample Success Response:**

```json
{
  "isSuccess": true,
  "message": "Registration successful",
  "data": {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "email": "newuser@example.com",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "Writer"
  },
  "statusCode": 200
}
```

### 5. Add Bank Details

**Purpose:** Adds bank account details for a user to enable withdrawals.

**URL:** `/api/user/bank-details/{userId}`
**Method:** `POST`
**Authorization:** Required - Admin, Producer, Writer roles

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | Guid | Yes | User's unique identifier |

**Request Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "accountNumber": "0123456789",
  "bankName": "First Bank of Nigeria",
  "bankCode": "011"
}
```

**Request Model - PostBankDetailDTO:**
| Property | Type | Required | Max Length | Description |
|----------|------|----------|------------|-------------|
| `AccountNumber` | string | Yes | 10 | NUBAN format account number |
| `BankName` | string | Yes | 100 | Full bank name |
| `BankCode` | string | Yes | 10 | Bank's unique code |

**Sample cURL Request:**

```bash
curl -X POST "https://api.bara.com/api/user/bank-details/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "0123456789",
    "bankName": "First Bank of Nigeria",
    "bankCode": "011"
  }'
```

**Sample React Fetch:**

```javascript
const response = await fetch(`/api/user/bank-details/${userId}`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    accountNumber: "0123456789",
    bankName: "First Bank of Nigeria",
    bankCode: "011",
  }),
});
```

### 6. Get Bank Details

**Purpose:** Retrieves all bank account details for a user.

**URL:** `/api/user/bank-details/{userId}`
**Method:** `GET`
**Authorization:** Required - Admin, Producer, Writer roles

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | Guid | Yes | User's unique identifier |

**Request Headers:**

```
Authorization: Bearer <jwt-token>
```

**Sample cURL Request:**

```bash
curl -X GET "https://api.bara.com/api/user/bank-details/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <jwt-token>"
```

**Sample Success Response:**

```json
{
  "isSuccess": true,
  "message": "Bank details retrieved successfully",
  "data": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174000",
      "accountNumber": "0123456789",
      "bankName": "First Bank of Nigeria",
      "bankCode": "011",
      "accountName": "John Doe",
      "isVerified": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "statusCode": 200
}
```

## Producer Endpoints

**Database Models Affected:** Producer, Address, Document, KycDetail

### 7. Add Producer Profile

**Purpose:** Creates a complete producer profile after user registration.

**URL:** `/api/producer/{userId}`
**Method:** `POST`
**Authorization:** Required - Producer, Admin roles

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | Guid | Yes | User's unique identifier |

**Request Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

- `FirstName`: string (required, max 50 chars)
- `LastName`: string (required, max 50 chars)
- `PhoneNumber`: string (required, max 15 chars)
- `ProfilePicture`: file (optional, image file)
- `CompanyName`: string (optional, max 100 chars)
- `CompanyDescription`: string (optional, max 500 chars)
- `Address`: object (required)
  - `Street`: string (required)
  - `City`: string (required)
  - `State`: string (required)
  - `Country`: string (required)
  - `PostalCode`: string (optional)

**Sample cURL Request:**

```bash
curl -X POST "https://api.bara.com/api/producer/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <jwt-token>" \
  -F "FirstName=John" \
  -F "LastName=Producer" \
  -F "PhoneNumber=+2348012345678" \
  -F "CompanyName=Nollywood Studios" \
  -F "ProfilePicture=@profile.jpg"
```

### 8. Get Producer Profile

**Purpose:** Retrieves the complete profile of a specific producer.

**URL:** `/api/producer/profile/{producerId}`
**Method:** `GET`
**Authorization:** Required - Producer, Admin roles

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `producerId` | Guid | Yes | Producer's unique identifier |

**Sample cURL Request:**

```bash
curl -X GET "https://api.bara.com/api/producer/profile/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <jwt-token>"
```

## Writer Endpoints

**Database Models Affected:** Writer, Address, Document, Experience, Service

### 9. Add Writer Profile

**Purpose:** Creates a complete writer profile after user registration.

**URL:** `/api/writer/{userId}`
**Method:** `POST`
**Authorization:** Required - Writer, Admin roles

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | Guid | Yes | User's unique identifier |

**Request Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

- `FirstName`: string (required, max 50 chars)
- `LastName`: string (required, max 50 chars)
- `PhoneNumber`: string (required, max 15 chars)
- `ProfilePicture`: file (optional, image file)
- `Bio`: string (required, max 1000 chars)
- `Experiences`: array of experience objects
- `VerificationDocument`: file (required, PDF/image)
- `Address`: object (required)

**Sample cURL Request:**

```bash
curl -X POST "https://api.bara.com/api/writer/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <jwt-token>" \
  -F "FirstName=Jane" \
  -F "LastName=Writer" \
  -F "Bio=Experienced screenwriter..." \
  -F "VerificationDocument=@id_card.pdf"
```

### 10. Get Writer Profile

**Purpose:** Retrieves the complete profile of a specific writer.

**URL:** `/api/writer/profile/{writerId}`
**Method:** `GET`
**Authorization:** Required - Writer, Admin roles

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `writerId` | Guid | Yes | Writer's unique identifier |

**Sample Success Response:**

```json
{
  "isSuccess": true,
  "message": "Writer profile retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "firstName": "Jane",
    "lastName": "Writer",
    "bio": "Experienced screenwriter with 10+ years...",
    "profilePicture": "https://storage.bara.com/profiles/jane-writer.jpg",
    "verificationStatus": "Verified",
    "isPremiumMember": true,
    "scripts": [
      {
        "id": "script-id-1",
        "title": "The Great Adventure",
        "genre": "Adventure",
        "price": 50000,
        "currencySymbol": "₦"
      }
    ],
    "experiences": [
      {
        "title": "Senior Screenwriter",
        "organization": "Nollywood Productions",
        "description": "Led script development for major productions"
      }
    ],
    "addressDetail": {
      "city": "Lagos",
      "state": "Lagos",
      "country": "Nigeria"
    }
  },
  "statusCode": 200
}
```

## Script Endpoints

**Database Models Affected:** Script, Document, ScriptGenre

### 11. Add Script

**Purpose:** Allows a writer to upload a new script to the marketplace.

**URL:** `/api/script/{writerId}`
**Method:** `POST`
**Authorization:** Required - Writer role with VerifiedOnly policy

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `writerId` | Guid | Yes | Writer's unique identifier |

**Request Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

- `Title`: string (required, max 200 chars)
- `Genre`: string (required, max 50 chars)
- `Logline`: string (required, max 300 chars)
- `Synopsis`: string (required, max 2000 chars)
- `Price`: decimal (required, min 0)
- `IsScriptRegistered`: boolean (required)
- `RegistrationBody`: string (optional, max 100 chars)
- `File`: file (required, PDF format, max 10MB)
- `Image`: string (optional, cover image URL)
- `CopyrightNumber`: string (optional, max 50 chars)
- `OwnershipRights`: enum (required)
- `ProofUrl`: string (optional, max 500 chars)

**Sample cURL Request:**

```bash
curl -X POST "https://api.bara.com/api/script/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <jwt-token>" \
  -F "Title=The Great Adventure" \
  -F "Genre=Adventure" \
  -F "Logline=A thrilling adventure story" \
  -F "Synopsis=Detailed plot summary..." \
  -F "Price=50000" \
  -F "IsScriptRegistered=true" \
  -F "File=@script.pdf"
```

**Sample Success Response:**

```json
{
  "isSuccess": true,
  "message": "Script uploaded successfully",
  "data": {
    "id": "script-123e4567-e89b-12d3-a456-426614174000",
    "title": "The Great Adventure",
    "genre": "Adventure",
    "price": 50000,
    "currencySymbol": "₦",
    "status": "Active"
  },
  "statusCode": 200
}
```

### 12. Get All Scripts (Paginated)

**Purpose:** Retrieves a paginated list of all available scripts in the marketplace.

**URL:** `/api/script/scripts/{pageNumber}/{pageSize}`
**Method:** `GET`
**Authorization:** None required

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageNumber` | integer | Yes | Page number (starts from 1) |
| `pageSize` | integer | Yes | Number of items per page (max 50) |

**Sample cURL Request:**

```bash
curl -X GET "https://api.bara.com/api/script/scripts/1/10"
```

**Sample React Fetch:**

```javascript
const response = await fetch("/api/script/scripts/1/10");
const result = await response.json();
```

**Sample Success Response:**

```json
{
  "isSuccess": true,
  "message": "Scripts retrieved successfully",
  "data": [
    {
      "id": "script-id-1",
      "title": "The Great Adventure",
      "genre": "Adventure",
      "logline": "A thrilling adventure story",
      "synopsis": "Detailed plot summary...",
      "price": 50000,
      "currencySymbol": "₦",
      "writerName": "Jane Writer",
      "writerId": "writer-id-1",
      "coverImage": "https://storage.bara.com/covers/adventure.jpg",
      "status": "Active",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "statusCode": 200,
  "totalCount": 150,
  "totalPages": 15,
  "pageNumber": 1
}
```

### 13. Search Scripts

**Purpose:** Searches for scripts based on title, genre, or other criteria.

**URL:** `/api/script/search`
**Method:** `GET`
**Authorization:** None required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search term |
| `pageNumber` | integer | No | Page number (default: 1) |
| `pageSize` | integer | No | Items per page (default: 10, max: 50) |

**Sample cURL Request:**

```bash
curl -X GET "https://api.bara.com/api/script/search?query=adventure&pageNumber=1&pageSize=10"
```

### 14. Get Scripts by Genre

**Purpose:** Retrieves scripts filtered by a specific genre.

**URL:** `/api/script/genre/{genre}`
**Method:** `GET`
**Authorization:** None required

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `genre` | string | Yes | Genre name (e.g., "Drama", "Comedy") |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageNumber` | integer | No | Page number (default: 1) |
| `pageSize` | integer | No | Items per page (default: 10) |

**Sample cURL Request:**

```bash
curl -X GET "https://api.bara.com/api/script/genre/Drama?pageNumber=1&pageSize=10"
```

### 15. Get Script Details

**Purpose:** Retrieves detailed information about a specific script.

**URL:** `/api/script/{scriptId}`
**Method:** `GET`
**Authorization:** None required

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `scriptId` | Guid | Yes | Script's unique identifier |

**Sample Success Response:**

```json
{
  "isSuccess": true,
  "message": "Script details retrieved successfully",
  "data": {
    "id": "script-id-1",
    "title": "The Great Adventure",
    "genre": "Adventure",
    "logline": "A thrilling adventure story",
    "synopsis": "Detailed plot summary of the adventure...",
    "price": 50000,
    "currencySymbol": "₦",
    "writer": {
      "id": "writer-id-1",
      "firstName": "Jane",
      "lastName": "Writer",
      "profilePicture": "https://storage.bara.com/profiles/jane.jpg",
      "verificationStatus": "Verified",
      "bio": "Experienced screenwriter..."
    },
    "coverImage": "https://storage.bara.com/covers/adventure.jpg",
    "isScriptRegistered": true,
    "registrationBody": "WGA",
    "copyrightNumber": "CR123456",
    "ownershipRights": "WriterRetainsRights",
    "status": "Active",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "statusCode": 200
}
```

## Script Transaction Endpoints

**Database Models Affected:** ScriptTransaction, PaymentTransaction, Wallet

### 16. Initiate Script Transaction

**Purpose:** Initiates a script purchase by escrowing funds from the producer's wallet.

**URL:** `/api/producers/{producerId}/scripts/transactions:initiate`
**Method:** `POST`
**Authorization:** Required - VerifiedOnly policy

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `producerId` | Guid | Yes | Producer's unique identifier |

**Request Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "scriptId": "script-123e4567-e89b-12d3-a456-426614174000",
  "writerId": "writer-123e4567-e89b-12d3-a456-426614174000"
}
```

**Sample cURL Request:**

```bash
curl -X POST "https://api.bara.com/api/producers/123e4567-e89b-12d3-a456-426614174000/scripts/transactions:initiate" \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "scriptId": "script-123e4567-e89b-12d3-a456-426614174000",
    "writerId": "writer-123e4567-e89b-12d3-a456-426614174000"
  }'
```

**Sample Success Response:**

```json
{
  "isSuccess": true,
  "message": "Script transaction initiated successfully",
  "data": {
    "scriptTransactionId": "trans-123e4567-e89b-12d3-a456-426614174000",
    "paymentTransactionId": "pay-123e4567-e89b-12d3-a456-426614174000",
    "status": "Escrowed",
    "expiresAt": "2024-01-29T10:30:00Z",
    "amount": 50000,
    "fee": 7500,
    "writerShare": 42500,
    "currencySymbol": "₦"
  },
  "statusCode": 200
}
```

### 17. Complete Script Transaction

**Purpose:** Completes a script transaction by releasing escrowed funds to the writer.

**URL:** `/api/producers/{producerId}/scripts/{scriptId}/transactions:complete`
**Method:** `POST`
**Authorization:** Required - VerifiedOnly policy

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `producerId` | Guid | Yes | Producer's unique identifier |
| `scriptId` | Guid | Yes | Script's unique identifier |

**Sample cURL Request:**

```bash
curl -X POST "https://api.bara.com/api/producers/123e4567-e89b-12d3-a456-426614174000/scripts/script-id/transactions:complete" \
  -H "Authorization: Bearer <jwt-token>"
```

## Transaction Endpoints

**Database Models Affected:** PaymentTransaction, Wallet

### 18. Initiate Payment Transaction

**Purpose:** Initiates a Paystack transaction for wallet funding.

**URL:** `/api/transaction/initiate/{userId}`
**Method:** `POST`
**Authorization:** Required - Admin, Producer, Writer roles

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | Guid | Yes | User's unique identifier |

**Request Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "amount": 10000.0
}
```

**Request Model - TransactionInitDTO:**
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `Amount` | decimal | Yes | Amount to fund (minimum 100) |

**Sample cURL Request:**

```bash
curl -X POST "https://api.bara.com/api/transaction/initiate/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10000.00}'
```

**Sample Success Response:**

```json
{
  "isSuccess": true,
  "message": "Transaction initiated successfully",
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/abc123",
    "accessCode": "abc123access",
    "reference": "bara_trans_123456789"
  },
  "statusCode": 200
}
```

### 19. Verify Payment Transaction

**Purpose:** Verifies a Paystack payment transaction using reference.

**URL:** `/api/transaction/verify-payment/{reference}`
**Method:** `POST`
**Authorization:** Required - Admin, Producer, Writer roles

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reference` | string | Yes | Payment reference from Paystack |

**Sample cURL Request:**

```bash
curl -X POST "https://api.bara.com/api/transaction/verify-payment/bara_trans_123456789" \
  -H "Authorization: Bearer <jwt-token>"
```

**Sample Success Response:**

```json
{
  "isSuccess": true,
  "message": "Payment verified successfully",
  "data": true,
  "statusCode": 200
}
```

### 20. Get User Transactions

**Purpose:** Retrieves paginated transaction history for a specific user.

**URL:** `/api/transaction/users/{userId}/transactions/{pageNumber}/{pageSize}`
**Method:** `GET`
**Authorization:** Required - Admin, Producer, Writer roles

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | Guid | Yes | User's unique identifier |
| `pageNumber` | integer | Yes | Page number (starts from 1) |
| `pageSize` | integer | Yes | Number of items per page |

**Sample cURL Request:**

```bash
curl -X GET "https://api.bara.com/api/transaction/users/123e4567-e89b-12d3-a456-426614174000/transactions/1/10" \
  -H "Authorization: Bearer <jwt-token>"
```

**Sample Success Response:**

```json
{
  "isSuccess": true,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "id": "trans-123e4567-e89b-12d3-a456-426614174000",
      "amount": 10000.0,
      "currencySymbol": "₦",
      "status": "Successful",
      "transactionType": "WalletFunding",
      "reference": "bara_trans_123456789",
      "createdAt": "2024-01-15T10:30:00Z",
      "completedAt": "2024-01-15T10:35:00Z"
    }
  ],
  "statusCode": 200,
  "totalCount": 25,
  "totalPages": 3,
  "pageNumber": 1
}
```

## Utility Endpoints

**Database Models Affected:** None (External Paystack API)

### 21. Get Banks

**Purpose:** Fetches a list of banks from Paystack for bank account setup.

**URL:** `/api/utility/banks`
**Method:** `GET`
**Authorization:** Required - Admin, Producer, Writer roles

**Request Headers:**

```
Authorization: Bearer <jwt-token>
```

**Sample cURL Request:**

```bash
curl -X GET "https://api.bara.com/api/utility/banks" \
  -H "Authorization: Bearer <jwt-token>"
```

**Sample Success Response:**

```json
{
  "isSuccess": true,
  "message": "Banks retrieved successfully",
  "data": [
    {
      "name": "First Bank of Nigeria",
      "code": "011",
      "country": "Nigeria",
      "currency": "NGN",
      "type": "nuban",
      "id": 1
    },
    {
      "name": "Guaranty Trust Bank",
      "code": "058",
      "country": "Nigeria",
      "currency": "NGN",
      "type": "nuban",
      "id": 2
    }
  ],
  "statusCode": 200
}
```

## Health Check Endpoints

**Database Models Affected:** None (System health monitoring)

### 22. Basic Health Check

**Purpose:** Simple health check endpoint to verify API availability.

**URL:** `/health`
**Method:** `GET`
**Authorization:** None required

**Sample cURL Request:**

```bash
curl -X GET "https://api.bara.com/health"
```

**Sample Success Response:**

```json
{
  "status": "Healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "Bara.API",
  "version": "1.0.0.0",
  "environment": "Production"
}
```

### 23. Simple Health Check

**Purpose:** Minimal health check endpoint.

**URL:** `/health/basic_health_check`
**Method:** `GET`
**Authorization:** None required

**Sample Response:**

```
"It works"
```

### 24. Detailed Health Check

**Purpose:** Comprehensive health check with system information.

**URL:** `/health/detailed`
**Method:** `GET`
**Authorization:** None required

**Sample Success Response:**

```json
{
  "status": "Healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "Bara.API",
  "version": "1.0.0.0",
  "environment": "Production",
  "machineName": "BARA-API-01",
  "processId": 12345,
  "workingSet": 104857600,
  "uptime": 3600000
}
```

## Error Handling

All endpoints return consistent error responses using the `ResponseDetail<T>` structure:

### Common Error Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 400         | Bad Request - Invalid input data          |
| 401         | Unauthorized - Missing or invalid token   |
| 403         | Forbidden - Insufficient permissions      |
| 404         | Not Found - Resource doesn't exist        |
| 409         | Conflict - Resource already exists        |
| 500         | Internal Server Error - Server-side error |

### Sample Error Response

```json
{
  "isSuccess": false,
  "message": "Validation failed",
  "data": null,
  "statusCode": 400,
  "error": "Email is required and must be valid"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **General endpoints**: 100 requests per minute per authenticated user
- **File upload endpoints**: 10 requests per minute per user

---

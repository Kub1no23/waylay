# Backend API Documentation

This document summarizes the ASP.NET backend API endpoints defined in `backend/Controllers`. Most endpoints use JWT bearer authentication and require valid `NameIdentifier` and `Role` claims. The base path for controllers is `/api`.

## Authentication

### Login
- Description: Authenticate a candidate or company and return a JWT token.
- Endpoint: `POST /api/auth/login`
- Authorization: None
- Body:
  - `Email` (string, required)
  - `Password` (string, required)
- Response:
  - `message`: string
  - `jwt`: string

### Register Candidate
- Description: Create a new candidate account.
- Endpoint: `POST /api/auth/register/candidate`
- Authorization: None
- Body:
  - `Email` (string, required)
  - `Password` (string, required)
  - `FirstName` (string, required)
  - `LastName` (string, required)
  - `Location` (string, optional)
  - `Headline` (string, optional)
  - `Summary` (string, optional)
  - `GithubUrl` (string, optional)
  - `PortfolioUrl` (string, optional)
- Response:
  - `message`: string

### Register Company
- Description: Create a new company account.
- Endpoint: `POST /api/auth/register/company`
- Authorization: None
- Body:
  - `Email` (string, required)
  - `Password` (string, required)
  - `Name` (string, required)
  - `Headquarters` (string, optional)
  - `Address` (string, optional)
  - `Industry` (string, optional)
  - `Description` (string, optional)
- Response:
  - `message`: string

## User Management

### Get Candidate Public Profile
- Description: Fetch public candidate information by candidate ID.
- Endpoint: `GET /api/user/candidate/{id}`
- Authorization: Bearer JWT
- Path parameters:
  - `id` (int) candidate ID
- Response:
  - Candidate profile fields (email, name, location, headline, summary, github/portfolio URLs)

### Update Candidate Account
- Description: Update the authenticated candidate's account details.
- Endpoint: `PUT /api/user/candidate`
- Authorization: Bearer JWT, role `candidate`
- Body:
  - `Email` (string, required)
  - `Password` (string, required)
  - `FirstName` (string, optional)
  - `LastName` (string, optional)
  - `Location` (string, optional)
  - `Headline` (string, optional)
  - `Summary` (string, optional)
  - `GithubUrl` (string, optional)
  - `PortfolioUrl` (string, optional)
- Response:
  - `message`: string

### Get Company Public Profile
- Description: Fetch public company information by company ID.
- Endpoint: `GET /api/user/company/{id}`
- Authorization: Bearer JWT
- Path parameters:
  - `id` (int) company ID
- Response:
  - Company profile fields (email, name, headquarters, address, industry, description)

### Update Company Account
- Description: Update the authenticated company's account details.
- Endpoint: `PUT /api/user/company`
- Authorization: Bearer JWT, role `company`
- Body:
  - `Email` (string, required)
  - `Password` (string, required)
  - `Name` (string, optional)
  - `Headquarters` (string, optional)
  - `Address` (string, optional)
  - `Industry` (string, optional)
  - `Description` (string, optional)
- Response:
  - `message`: string

## Profile Management

### Create Profile
- Description: Create a new profile for the authenticated user.
- Endpoint: `POST /api/profile`
- Authorization: Bearer JWT
- Body:
  - `Title` (string, required)
  - `Summary` (string, optional)
  - `Location` (string, optional)
  - `RemotePreference` (string, optional)
  - `YearsExperience` (int, optional)
  - `IsActive` (bool, optional)
- Response:
  - Created profile object

### Update Profile
- Description: Update an existing profile owned by the authenticated user.
- Endpoint: `PUT /api/profile/{id}`
- Authorization: Bearer JWT
- Path parameters:
  - `id` (int) profile ID
- Body:
  - `Title` (string, optional)
  - `Summary` (string, optional)
  - `Location` (string, optional)
  - `RemotePreference` (string, optional)
  - `YearsExperience` (int, optional)
  - `IsActive` (bool, optional)
- Response:
  - `message`: string
  - `profile`: updated profile object

### Get My Profiles
- Description: Retrieve profiles owned by the authenticated user.
- Endpoint: `GET /api/profile/my`
- Authorization: Bearer JWT
- Response:
  - Array of profile objects

### Get Profile By ID
- Description: Retrieve a profile by ID if the authenticated user owns it.
- Endpoint: `GET /api/profile/{id}`
- Authorization: Bearer JWT
- Path parameters:
  - `id` (int) profile ID
- Response:
  - Profile object

### Delete Profile
- Description: Delete a profile owned by the authenticated user.
- Endpoint: `DELETE /api/profile/{id}`
- Authorization: Bearer JWT
- Path parameters:
  - `id` (int) profile ID
- Response:
  - `message`: string

## Match Management

### Lookup Candidate Matches for Company Profile
- Description: Perform a semantic match lookup for a company profile against candidate profiles.
- Endpoint: `GET /api/match/lookup/{companyProfileId}`
- Authorization: Bearer JWT
- Path parameters:
  - `companyProfileId` (int)
- Response:
  - `searchedProfileId`, `totalCompanyFlags`, `candidatesProfileMatches`

### Create Match Status
- Description: Create or accept a match status between candidate and company.
- Endpoint: `POST /api/match`
- Authorization: Bearer JWT
- Body:
  - `SourceId` (int)
  - `TargetId` (int)
- Response:
  - `message`: string
  - `status`: match status object

### Get My Matches
- Description: List match statuses for the authenticated candidate or company.
- Endpoint: `GET /api/match`
- Authorization: Bearer JWT
- Response:
  - Array of match status summaries

### Delete Match Status
- Description: Delete a match status if owned by the authenticated user.
- Endpoint: `DELETE /api/match/{statusId}`
- Authorization: Bearer JWT
- Path parameters:
  - `statusId` (int)
- Response:
  - `message`: string
  - `deletedStatusId`: int

## Chat Management

### Send Message to User
- Description: Send a chat message to a matched user and broadcast it over SignalR.
- Endpoint: `POST /api/chat/user/{targetUserId}`
- Authorization: Bearer JWT
- Path parameters:
  - `targetUserId` (int)
- Body:
  - `Content` (string, required)
- Response:
  - `message`: string
  - `data`: sent message object

### Mark Messages As Read
- Description: Mark unread messages as read for a given chat.
- Endpoint: `POST /api/chat/{id}/read`
- Authorization: Bearer JWT
- Path parameters:
  - `id` (int) chat status ID
- Response:
  - `message`: string

### Get Chat History
- Description: Retrieve chat history for a specific status/chat.
- Endpoint: `GET /api/chat/{id}`
- Authorization: Bearer JWT
- Path parameters:
  - `id` (int) chat status ID
- Response:
  - `chatId`, `CreatedAt`, `UpdatedAt`, `Messages`

### Get User Chats
- Description: List chats for the authenticated user with latest message preview.
- Endpoint: `GET /api/chat`
- Authorization: Bearer JWT
- Response:
  - Array of chat summaries

## Flag Management

### Search Flags
- Description: Search global flags by name or category with pagination.
- Endpoint: `GET /api/flag`
- Authorization: Bearer JWT
- Query parameters:
  - `q` (string, optional)
  - `category` (string, optional)
  - `page` (int, optional, default `1`)
- Response:
  - `TotalCount`, `TotalPages`, `CurrentPage`, `PageSize`, `HasNextPage`, `Data`

### Create Global Flag
- Description: Create a new global flag and generate a semantic embedding for it.
- Endpoint: `POST /api/flag`
- Authorization: None
- Body:
  - `Name` (string, required)
  - `Category` (string, required)
- Response:
  - `message`: string
  - `flag`: created flag summary

### Assign Flags to Profile
- Description: Attach semantic flags to a profile owned by the authenticated user.
- Endpoint: `POST /api/profile/{id}/flag`
- Authorization: Bearer JWT
- Path parameters:
  - `id` (int) profile ID
- Body:
  - `Flags` (object): dictionary mapping flag IDs to optional weights
- Response:
  - `message`: string
  - `skippedCount`: int

### Delete Flags From Profile
- Description: Remove assigned flags from a profile owned by the authenticated user.
- Endpoint: `DELETE /api/profile/{id}/flag`
- Authorization: Bearer JWT
- Path parameters:
  - `id` (int) profile ID
- Body:
  - `FlagIds` (array[int], required)
- Response:
  - `message`: string

## Realtime Chat Hub

### SignalR Hub Endpoint
- Description: Connect to the chat hub for real-time messaging and notifications.
- Endpoint: `/api/hub/chat`
- Authorization: Bearer JWT via `access_token` query parameter for WebSocket connections
- Groups:
  - `candidate_{userId}` for candidate connections
  - `company_{userId}` for company connections

### Hub Methods
- `SendMessage(chatId, messageText)`
  - Broadcasts a message to both participants in the chat.
- `SendTypingSignal(chatId, isTyping)`
  - Emits typing presence to the other participant.
- `SendReadReceipt(chatId)`
  - Notifies the other participant that messages were read.

## Notes
- All protected routes require the standard JWT bearer header `Authorization: Bearer <token>` unless called out as unauthenticated.
- The backend uses the authenticated user's `NameIdentifier` claim as their numeric ID and `Role` claim as either `candidate` or `company`.
- `POST /api/flag` is the only anonymous endpoint in `FlagController`.

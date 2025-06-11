# SRE AI Chat API - README

This document provides detailed information about the SRE AI Chat API, including its purpose, setup instructions, API endpoint documentation, and example usage. The API facilitates chat interactions with a Google Gemini-powered AI, stores conversation history and session summaries in MongoDB, and provides functionality for mock incident reporting.

## Table of Contents

1.  [Overview](#overview)
2.  [Features](#features)
3.  [Project Structure (Backend)](#project-structure-backend)
4.  [Prerequisites](#prerequisites)
5.  [Setup and Configuration](#setup-and-configuration)
    *   [Environment Variables (`.env`)](#environment-variables-env)
    *   [Python Dependencies (`requirements.txt`)](#python-dependencies-requirementstxt)
6.  [Running the Application](#running-the-application)
    *   [Locally with Uvicorn](#locally-with-uvicorn)
    *   [With Docker Compose](#with-docker-compose)
7.  [API Endpoints Documentation](#api-endpoints-documentation)
    *   [7.1. Health Check (`/health`)](#71-health-check-health)
    *   [7.2. Get Current Incidents (`/api/incidents`)](#72-get-current-incidents-apiincidents)
    *   [7.3. List All Chat Session Summaries (`/api/sessions/summary`)](#73-list-all-chat-session-summaries-apisessionssummary)
    *   [7.4. List All Chat Session IDs (from messages - Deprecated) (`/api/sessions/ids`)](#74-list-all-chat-session-ids-from-messages---deprecated-apisessionsids)
    *   [7.5. Chat with AI (`/api/chat`)](#75-chat-with-ai-apichat)
    *   [7.6. Get Session History (`/api/history/{session_id}`)](#76-get-session-history-apihistorysession_id)
    *   [7.7. Delete Chat Session (`/api/session/{session_id}`)](#77-delete-chat-session-apisessionsession_id)
8.  [Data Models](#data-models)
9.  [Development](#development)
    *   [Dockerfile](#dockerfile)
    *   [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The SRE AI Chat API is a backend service built with FastAPI. It provides endpoints for:
*   Initiating and continuing chat conversations with an AI model (Google Gemini).
*   Storing and retrieving chat history and session summaries (ID, title, last message timestamp) using MongoDB.
*   Automatically generating titles for new chat sessions based on initial interactions.
*   Listing all unique chat session IDs and summaries.
*   Checking the health of the API service.
*   Deleting chat sessions (both messages and summary).
*   Reporting current (mocked) SRE incidents.

---

## Features

*   **AI Chat Interaction:** Leverages Google Gemini for natural language understanding and response generation.
*   **Session Management:** Supports distinct chat sessions, each with its own history and summary.
*   **Automatic Session Titling:** Generates concise titles for chat sessions based on the initial user message and AI response.
*   **Persistent Chat Storage:** Stores all messages and session summaries in a MongoDB database. Session summaries include the timestamp of the last message.
*   **Session Discovery:** Endpoint to list all session summaries with titles and last message timestamps, sorted by recent activity.
*   **Incident Reporting:** Endpoint to retrieve current (mocked) SRE incidents.
*   **Asynchronous Operations:** Built with FastAPI and `async/await` for efficient non-blocking I/O.
*   **Environment-based Configuration:** Uses `.env` files for sensitive information like API keys and database URLs.
*   **Containerization Support:** Includes a multi-stage `Dockerfile` for building optimized Docker images.
*   **Health Check:** Provides a simple endpoint to verify service status.

---

## Project Structure (Backend)

The FastAPI backend is typically organized within a `chat_api/` directory:

```
chat_api/
├── .env                    # Environment variables (not committed to Git)
├── main.py                 # FastAPI application entry point, routes
├── models.py               # Pydantic models for request/response data
├── db.py                   # MongoDB connection and database helper functions
├── gemini_client.py        # Logic for interacting with Google Gemini API
├── requirements.txt        # Python dependencies
└── Dockerfile              # For building the Docker image
```

---

## Prerequisites

*   Python 3.9+ (or the version specified in your Dockerfile, e.g., 3.10)
*   Docker and Docker Compose (for containerized deployment)
*   Access to a MongoDB instance (local or cloud-hosted)
*   Google AI Studio API Key (for Gemini)

---

## Setup and Configuration

### Environment Variables (`.env`)

Create a `.env` file in the `chat_api/` directory. **This file should not be committed to version control.**

```env
GOOGLE_API_KEY="YOUR_GOOGLE_AI_STUDIO_API_KEY"

# For Docker Compose setup, MONGODB_URL uses the service name 'mongodb' from docker-compose.yml
MONGODB_URL="mongodb://mongodb:27017/sre_chat_db"
MONGODB_DATABASE_NAME="sre_chat_db"

# Example for local MongoDB connection (if not using Docker Compose for MongoDB):
# MONGODB_URL="mongodb://localhost:27017/sre_chat_db"

# REACT_BUILD_DIR: This variable is no longer needed as the download feature was removed.
```

**Replace placeholders:**
*   `YOUR_GOOGLE_AI_STUDIO_API_KEY`: Your actual API key from Google AI Studio.
*   Adjust `MONGODB_URL` based on your MongoDB setup.

### Python Dependencies (`requirements.txt`)

The `chat_api/requirements.txt` file should contain:
```txt
fastapi
uvicorn[standard]
pydantic
python-dotenv
google-generativeai
motor  # Async MongoDB driver
pymongo # For creating indexes (optional but helpful for startup)
# shutil and pathlib are standard Python libraries used for the removed download feature
```
Install these using: `pip install -r requirements.txt` (preferably in a virtual environment if running locally without Docker).

---

## Running the Application

### Locally with Uvicorn

1.  Ensure Python, MongoDB (running and accessible), and all dependencies are installed.
2.  Set up the `.env` file in the `chat_api/` directory.
3.  Navigate to the `chat_api/` directory in your terminal.
4.  Run the Uvicorn server:
    ```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```
    *   `--reload`: Enables auto-reloading for development.
    The API will be accessible at `http://localhost:8000`.

### With Docker Compose

This is the recommended method for development and simplifies deployment.

1.  **Prerequisites:** Docker and Docker Compose installed.
2.  **Project Setup:**
    *   Ensure you have the `chat_api/` directory with all its files (including `Dockerfile` and `.env`).
    *   A `docker-compose.yml` file in the parent directory of `chat_api/` (the content for this file has been provided in previous interactions, including services for `mongodb`, `api`, and `mongo-express`).
3.  **Build and Start:**
    Navigate to the directory containing your `docker-compose.yml` file and run:
    ```bash
    docker-compose up --build -d
    ```
    *   `--build`: Builds the API image if it doesn't exist or if the `Dockerfile` or its context has changed.
    *   `-d`: Runs in detached mode.
4.  **Access:**
    *   FastAPI API: `http://localhost:8000`
    *   Swagger/OpenAPI Docs: `http://localhost:8000/docs`
    *   Mongo Express (if included in `docker-compose.yml`): `http://localhost:8081`
    *   MongoDB (if port mapped in `docker-compose.yml`): `mongodb://localhost:27017`
5.  **Stop:**
    ```bash
    docker-compose down
    ```
    (Use `docker-compose down -v` to remove MongoDB data volume as well, for a clean slate).

---

## API Endpoints Documentation

**Base URL:** The documentation assumes the API is running at `http://localhost:8000`. Replace this with your actual deployed URL if different.

### 7.1. Health Check (`/health`)

*   **Method:** `GET`
*   **Tag:** `Health`
*   **Description:** A simple endpoint to confirm the API is live and responsive.
*   **Success Response (200 OK):**
    ```json
    {
        "status": "ok",
        "message": "SRE AI Chat API is running!"
    }
    ```
*   **Sample Request (cURL):**
    ```bash
    curl -X GET http://localhost:8000/health
    ```

### 7.2. Get Current Incidents (`/api/incidents`)

*   **Method:** `GET`
*   **Tag:** `Incidents`
*   **Description:** Retrieves a list of current (mocked) SRE incidents, each with associated alerts. This data is dynamically generated for demonstration.
*   **Success Response (200 OK):** An array of `Incident` objects.
    ```json
    [
        {
            "incident_name": "Service Degradation: Success Rate Triggered #1",
            "incident_time": "2024-03-11T14:05:10.123Z",
            "alerts": [
                {
                    "source": "Grafana",
                    "title": "[PROD] API Errors > 5% - Value=6.78",
                    "alert_id": 12345,
                    "path": "s3://vncs-aiops-data/telemetry/grafana/...",
                    "entityId": "grafana-entity-uuid",
                    "displayName": "grafana-item-23"
                }
                // ... more alerts
            ]
        }
        // ... more incidents
    ]
    ```
*   **Sample Request (cURL):**
    ```bash
    curl -X GET http://localhost:8000/api/incidents
    ```

### 7.3. List All Chat Session Summaries (`/api/sessions/summary`)

*   **Method:** `GET`
*   **Tag:** `Chat Session`
*   **Description:** Retrieves a list of all chat sessions, including their ID, a generated title, and the timestamp of the **last message** in that session. Sessions are sorted by the most recent activity (last message time, descending).
*   **Success Response (200 OK):** An array of `SessionSummary` objects.
    ```json
    [
        {
            "session_id": "session_uuid_1",
            "title": "Discussion on SRE Principles",
            "last_message_timestamp": "2024-03-11T14:30:00Z"
        },
        {
            "session_id": "session_uuid_2",
            "title": "Troubleshooting API Latency",
            "last_message_timestamp": "2024-03-11T12:00:00Z"
        }
    ]
    ```
    If no sessions exist, an empty array `[]` is returned. `last_message_timestamp` can be `null` if a session summary record exists but has no actual messages recorded yet.
*   **Sample Request (cURL):**
    ```bash
    curl -X GET http://localhost:8000/api/sessions/summary
    ```

### 7.4. List All Chat Session IDs (from messages - Deprecated) (`/api/sessions/ids`)

*   **Method:** `GET`
*   **Tag:** `Chat Session Deprecated`
*   **Description:** Retrieves a list of all unique session IDs found directly in the chat messages collection. **It is recommended to use the `/api/sessions/summary` endpoint instead for richer and more structured session information.**
*   **Success Response (200 OK):** An array of session ID strings.
    ```json
    [
        "session_id_alpha",
        "session_id_beta"
    ]
    ```
*   **Sample Request (cURL):**
    ```bash
    curl -X GET http://localhost:8000/api/sessions/ids
    ```

### 7.5. Chat with AI (`/api/chat`)

*   **Method:** `POST`
*   **Tag:** `Chat`
*   **Description:** Main endpoint for chat interaction. Sends a user message to the AI. If `session_id` is `null` or omitted, a new session is created, a session summary record is made with a default title, and the API attempts to generate a more descriptive title based on the first user message and AI response. The session's last message timestamp is updated on each interaction.
*   **Request Body (JSON):**
    ```json
    {
        "message": "Your message to the AI.",
        "session_id": "optional_existing_session_id_or_null"
    }
    ```
    *   `message` (string, required): The user's input text.
    *   `session_id` (string, optional): ID of an existing session. If `null` or not provided, a new session ID is generated.
*   **Success Response (200 OK):** An `AIChatResponse` object containing the `session_id`, `ai_reply`, and `full_history`.
    ```json
    {
        "session_id": "generated_or_provided_session_id",
        "ai_reply": "The AI's response to your message.",
        "full_history": [
            // ... array of MessageInDB objects ...
        ]
    }
    ```
*   **Error Responses:**
    *   `500 Internal Server Error`: If the AI service is misconfigured (e.g., missing `GOOGLE_API_KEY`) or an internal error occurs during AI interaction or database operations.
*   **Sample Request (cURL - New Session):**
    ```bash
    curl -X POST http://localhost:8000/api/chat \
    -H "Content-Type: application/json" \
    -d '{
        "message": "What are some key SRE metrics to track for a web service?",
        "session_id": null
    }'
    ```

### 7.6. Get Session History (`/api/history/{session_id}`)

*   **Method:** `GET`
*   **Tag:** `Chat History`
*   **Path Parameter:**
    *   `session_id` (string, required): The ID of the chat session.
*   **Description:** Retrieves the full message history (user and AI messages) for a specific session.
*   **Success Response (200 OK):** An array of `MessageInDB` objects. Returns `[]` if the session ID is not found or has no messages.
*   **Sample Request (cURL - replace `your_session_id`):**
    ```bash
    curl -X GET http://localhost:8000/api/history/your_session_id
    ```

### 7.7. Delete Chat Session (`/api/session/{session_id}`)

*   **Method:** `DELETE`
*   **Tag:** `Chat Session`
*   **Path Parameter:**
    *   `session_id` (string, required): The ID of the chat session to delete.
*   **Description:** Deletes all messages from the `chat_messages` collection and the corresponding summary record from the `chat_sessions` collection for the given `session_id`. Also clears any in-memory AI session state.
*   **Success Response (204 No Content):** No response body. Indicates the operation was successful.
*   **Sample Request (cURL - replace `your_session_id_to_delete`):**
    ```bash
    curl -X DELETE http://localhost:8000/api/session/your_session_id_to_delete -v
    ```
    (Use `-v` for verbose output to see the 204 status).

---

## Data Models

The API uses Pydantic models for request and response validation and serialization. Key models (defined in `chat_api/models.py`):

*   **`MessageInDB`**: Represents a single stored chat message.
    *   `id: str`, `session_id: str`, `role: str` ("user" or "model"), `content: str`, `timestamp: datetime`
*   **`SessionSummary`**: Summary of a chat session.
    *   `session_id: str`, `title: Optional[str]`, `last_message_timestamp: Optional[datetime]`
*   **`UserMessageInput`**: Input for `/api/chat`.
    *   `message: str`, `session_id: Optional[str]`
*   **`AIChatResponse`**: Response from `/api/chat`.
    *   `session_id: str`, `ai_reply: str`, `full_history: List[MessageInDB]`
*   **`HealthResponse`**: Response from `/health`.
    *   `status: str`, `message: str`
*   **`Incident`**: Contains `incident_name: str`, `incident_time: datetime`, `alerts: List[Alert]`.
*   **`Alert`**: Contains `source: str`, `title: str`, `alert_id: Any` (can be int or str), `path: Optional[str]`, `entityId: Optional[str]`, `displayName: Optional[str]`.

---

## Development

### Dockerfile
A multi-stage `Dockerfile` is provided in `chat_api/Dockerfile` for efficient image building, separating build and runtime environments and using a non-root user.

### Testing
(Placeholder for future testing strategy)
*   **Unit Tests:** Use `pytest` for individual functions in `db.py`, `gemini_client.py`, and utilities. Mock external dependencies like MongoDB and Gemini API.
*   **Integration Tests:** Use FastAPI's `TestClient` to test API endpoint logic, possibly with a test MongoDB instance.

---

## Troubleshooting

*   **`GOOGLE_API_KEY` Not Found / AI Errors:** Ensure the key is correctly set in your `.env` file and that your Google AI Studio project and API key are active and have the necessary permissions for the Gemini model. Check `gemini_client.py` logs for errors from the Gemini API.
*   **MongoDB Connection Issues:** Verify the `MONGODB_URL` in `.env` is correct for your MongoDB setup (local, Docker container, or cloud). Check MongoDB server logs. If using Docker Compose, ensure the `mongodb` service is healthy (`docker-compose ps`).
*   **CORS Errors (when frontend connects):** Confirm that the origin of your frontend application (e.g., `http://localhost:3000` for React dev server) is listed in the `allow_origins` of the `CORSMiddleware` in `chat_api/main.py`. If using `allow_origins=["*"]`, be mindful of security for production.
*   **`uvicorn: command not found` in Docker:** Ensure `uvicorn[standard]` is listed in `chat_api/requirements.txt` and that the `PATH` environment variable in the Docker image's final stage is set correctly to find executables from the installed Python packages (e.g., `/app/venv/bin` if a virtual environment is copied to `/app/venv`).
*   **Pydantic Validation Errors (422 Unprocessable Entity):** Check if the request body sent to an endpoint matches the Pydantic model defined for that endpoint in `chat_api/models.py`. The error response usually details which field is problematic.
*   **Unexpected Behavior with Session Titles/Timestamps:** Verify the logic in `db.py` for `create_or_get_session_summary` and `update_session_last_message_timestamp`, and in `main.py` where these are called within the `/api/chat` endpoint. Check MongoDB directly (using `mongo-express` or Compass) to inspect the `chat_sessions` collection.
*   Consult application logs (FastAPI console output or Docker logs via `docker-compose logs api`) for more specific error messages and tracebacks.

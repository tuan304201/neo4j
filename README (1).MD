# SRE AI Chat API - README

This document provides detailed information about the SRE AI Chat API, including its purpose, setup instructions, API endpoint documentation, and example usage. The API facilitates chat interactions with a Google Gemini-powered AI, stores conversation history in MongoDB, and offers functionality to download a pre-built React UI.

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
    *   [7.1. Health Check](#71-health-check)
    *   [7.2. List All Chat Sessions](#72-list-all-chat-sessions)
    *   [7.3. Chat with AI](#73-chat-with-ai)
    *   [7.4. Get Session History](#74-get-session-history)
    *   [7.5. Delete Chat Session](#75-delete-chat-session)
8.  [Data Models](#data-models)
9.  [Development](#development)
    *   [Dockerfile](#dockerfile)
    *   [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The SRE AI Chat API is a backend service built with FastAPI. It provides endpoints for:
*   Initiating and continuing chat conversations with an AI model (Google Gemini).
*   Storing and retrieving chat history using MongoDB.
*   Listing all unique chat session IDs.
*   Checking the health of the API service.
*   Deleting chat sessions.
*   Serving a pre-built React chat application UI as a downloadable ZIP archive.

---

## Features

*   **AI Chat Interaction:** Leverages Google Gemini for natural language understanding and response generation.
*   **Session Management:** Supports distinct chat sessions, each with its own history.
*   **Persistent Chat History:** Stores all messages (user and AI) in a MongoDB database.
*   **Session Discovery:** Endpoint to list all active/past session IDs.
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

*   Python 3.9+
*   Docker and Docker Compose (for containerized deployment)
*   Access to a MongoDB instance (local or cloud-hosted)
*   Google AI Studio API Key (for Gemini)
*   A pre-built React application (for the download feature)

---

## Setup and Configuration

### Environment Variables (`.env`)

Create a `.env` file in the `chat_api/` directory with the following variables. **This file should not be committed to version control.**

```env
GOOGLE_API_KEY="YOUR_GOOGLE_AI_STUDIO_API_KEY"

# For Docker Compose setup, MONGODB_URL uses the service name 'mongodb'
MONGODB_URL="mongodb://mongodb:27017/sre_chat_db"
MONGODB_DATABASE_NAME="sre_chat_db"

# Example for local MongoDB without Docker Compose:
# MONGODB_URL="mongodb://localhost:27017/sre_chat_db"

```

**Replace placeholders:**
*   `YOUR_GOOGLE_AI_STUDIO_API_KEY`: Your actual API key from Google AI Studio.
*   Adjust `MONGODB_URL` based on your MongoDB setup. If MongoDB is running via Docker Compose as service `mongodb`, the provided URL is correct.
*   Adjust `REACT_BUILD_DIR` to point to the correct path of your pre-built React application's output directory (e.g., `build` for Create React App, `dist` for Vite).

### Python Dependencies (`requirements.txt`)

The `chat_api/requirements.txt` file should contain:
```txt
fastapi
uvicorn[standard]
pydantic
python-dotenv
google-generativeai
motor  # Async MongoDB driver
pymongo # For creating indexes
# shutil and pathlib are standard Python libraries
```
Install these using: `pip install -r requirements.txt` (preferably in a virtual environment).

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
    *   A `docker-compose.yml` file in the parent directory of `chat_api/`.
3.  **Build and Start:**
    Navigate to the directory containing your `docker-compose.yml` file and run:
    ```bash
    docker-compose up --build -d
    ```
    *   `--build`: Builds the API image if it doesn't exist or if the Dockerfile has changed.
    *   `-d`: Runs in detached mode.
4.  **Access:**
    *   API: `http://localhost:8000`
    *   Swagger Docs: `http://localhost:8000/docs`
    *   MongoDB (if mapped in `docker-compose.yml`): `mongodb://localhost:27017`
5.  **Stop:**
    ```bash
    docker-compose down
    ```
    (Use `docker-compose down -v` to remove MongoDB data volume as well).

---

## API Endpoints Documentation

**Base URL:** The documentation assumes the API is running at `http://localhost:8000`. Replace this with your actual deployed URL if different.

### 7.1. Health Check

*   **Endpoint:** `/health`
*   **Method:** `GET`
*   **Tag:** `Health`
*   **Description:** A simple endpoint to confirm the API is live.
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

### 7.2. List All Chat Sessions

*   **Endpoint:** `/api/sessions`
*   **Method:** `GET`
*   **Tag:** `Chat Session`
*   **Description:** Retrieves a list of all unique session IDs that have associated chat history. Useful for discovering active or past chat sessions.
*   **Success Response (200 OK):**
    An array of strings, where each string is a unique `session_id`.
    ```json
    [
        "session_id_alpha",
        "session_id_beta",
        "session_id_gamma"
    ]
    ```
    If no sessions exist, an empty array `[]` is returned.
*   **Sample Request (cURL):**
    ```bash
    curl -X GET http://localhost:8000/api/sessions
    ```

### 7.3. Chat with AI

*   **Endpoint:** `/api/chat`
*   **Method:** `POST`
*   **Tag:** `Chat`
*   **Description:** Sends a user message to the AI, retrieves a response, and manages chat history. A new session is created if `session_id` is null or omitted.
*   **Request Body (JSON):**
    ```json
    {
        "message": "Your message to the AI.",
        "session_id": "optional_existing_session_id_or_null"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
        "session_id": "generated_or_provided_session_id",
        "ai_reply": "The AI's response to your message.",
        "full_history": [
            {
                "id": "unique_message_id_user",
                "session_id": "same_as_above_session_id",
                "role": "user",
                "content": "Your message to the AI.",
                "timestamp": "2024-03-11T12:30:00.123Z"
            },
            {
                "id": "unique_message_id_ai",
                "session_id": "same_as_above_session_id",
                "role": "model",
                "content": "The AI's response to your message.",
                "timestamp": "2024-03-11T12:30:05.456Z"
            }
        ]
    }
    ```
*   **Error Responses:**
    *   `500 Internal Server Error`: If AI service is misconfigured or an internal error occurs.
*   **Sample Request (cURL - New Session):**
    ```bash
    curl -X POST http://localhost:8000/api/chat \
    -H "Content-Type: application/json" \
    -d '{
        "message": "Hello, SRE Agent!",
        "session_id": null
    }'
    ```

### 7.4. Get Session History

*   **Endpoint:** `/api/history/{session_id}`
*   **Method:** `GET`
*   **Tag:** `Chat History`
*   **Path Parameter:**
    *   `session_id` (string, required): The ID of the chat session.
*   **Success Response (200 OK):**
    An array of message objects.
    ```json
    [
        {"id": "msg1", "session_id": "your_session_id", "role": "user", "content": "Query", "timestamp": "..."}
    ]
    ```
    Returns `[]` if no history is found.
*   **Sample Request (cURL - replace `your_session_id`):**
    ```bash
    curl -X GET http://localhost:8000/api/history/your_session_id
    ```

### 7.5. Delete Chat Session

*   **Endpoint:** `/api/session/{session_id}`
*   **Method:** `DELETE`
*   **Tag:** `Chat Session`
*   **Path Parameter:**
    *   `session_id` (string, required): The ID of the chat session to delete.
*   **Success Response (204 No Content):**
    No response body.
*   **Sample Request (cURL - replace `your_session_id_to_delete`):**
    ```bash
    curl -X DELETE http://localhost:8000/api/session/your_session_id_to_delete -v
    ```

---

## Data Models

The API uses Pydantic models for request and response validation and serialization. Key models include:

*   **`MessageInDB`**: Represents a single message stored in the database.
    *   `id` (str): Unique ID of the message.
    *   `session_id` (str): ID of the chat session this message belongs to.
    *   `role` (str): Sender of the message ("user" or "model").
    *   `content` (str): Text content of the message.
    *   `timestamp` (datetime): Timestamp of when the message was created.
*   **`UserMessageInput`**: Expected structure for user input in the `/api/chat` endpoint.
*   **`AIChatResponse`**: Structure of the successful response from the `/api/chat` endpoint.
*   **`HealthResponse`**: Structure of the response from the `/health` endpoint.

Refer to `chat_api/models.py` for detailed Pydantic definitions.

---

## Development

### Dockerfile

A multi-stage `Dockerfile` is provided in `chat_api/Dockerfile` for building efficient and smaller Docker images. It separates the build environment from the runtime environment.

### Testing

(Placeholder for future testing strategy)
Consider adding unit tests (e.g., using `pytest`) for:
*   Database helper functions (`db.py`).
*   Gemini client logic (`gemini_client.py`).
*   API endpoints logic (`main.py` using FastAPI's `TestClient`).
Integration tests should verify the end-to-end flow with test instances of dependencies.

---

## Troubleshooting

*   **`GOOGLE_API_KEY` not found:** Ensure this is set in `.env` and loaded.
*   **MongoDB Connection Issues:** Verify `MONGODB_URL` in `.env` and MongoDB service status.
*   **CORS Errors (from UI):** Check `origins` in `main.py`'s CORS middleware.
*   **`uvicorn: command not found` (Docker):** Confirm `uvicorn[standard]` is in `requirements.txt` and `PATH` is correct in Docker.
*   **React App Download Fails (404):** Validate `REACT_BUILD_DIR` in `.env` and that the React app is built to that location.
*   Consult application logs (console output or Docker logs via `docker-compose logs api`) for more detailed error messages.

---
```

## Updated Postman Collection JSON

This version includes the new `/api/sessions` endpoint.

```json
{
	"info": {
		"_postman_id": "00000000-0000-0000-0000-000000000000",
		"name": "SRE AI Chat API v4",
		"description": "Collection for testing the FastAPI SRE Chat API with Gemini and MongoDB. Includes session listing.",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
	},
	"item": [
		{
			"name": "Service Health Check",
			"request": {
				"method": "GET",
				"header": [],
				"url": {
					"raw": "{{baseUrl}}/health",
					"host": [
						"{{baseUrl}}"
					],
					"path": [
						"health"
					]
				},
				"description": "Checks if the API service is running and healthy."
			},
			"response": []
		},
		{
			"name": "List All Chat Sessions",
			"request": {
				"method": "GET",
				"header": [],
				"url": {
					"raw": "{{baseUrl}}/api/sessions",
					"host": [
						"{{baseUrl}}"
					],
					"path": [
						"api",
						"sessions"
					]
				},
				"description": "Retrieves a list of all unique session IDs from the chat history."
			},
			"response": []
		},
		{
			"name": "Chat with AI (New Session)",
			"event": [
				{
					"listen": "test",
					"script": {
						"id": "00000000-0000-0000-0000-000000000001",
						"exec": [
							"// Automatically save the session_id from the response to a collection variable",
							"try {",
							"    var jsonData = pm.response.json();",
							"    if (jsonData && jsonData.session_id) {",
							"        pm.collectionVariables.set(\"current_session_id\", jsonData.session_id);",
							"        console.log('Set current_session_id to: ' + jsonData.session_id);",
							"    } else {",
							"        console.log('Could not find session_id in the response body.');",
							"    }",
							"} catch (e) {",
							"    console.log('Error parsing response or setting variable: ' + e);",
							"}"
						],
						"type": "text/javascript"
					}
				}
			],
			"request": {
				"method": "POST",
				"header": [
					{
						"key": "Content-Type",
						"value": "application/json",
						"type": "text"
					}
				],
				"body": {
					"mode": "raw",
					"raw": "{\n    \"message\": \"Hello, what is the current date according to your context?\",\n    \"session_id\": null\n}",
					"options": {
						"raw": {
							"language": "json"
						}
					}
				},
				"url": {
					"raw": "{{baseUrl}}/api/chat",
					"host": [
						"{{baseUrl}}"
					],
					"path": [
						"api",
						"chat"
					]
				},
				"description": "Starts a new chat session. The test script saves `session_id`."
			},
			"response": []
		},
		{
			"name": "Chat with AI (Continue Session)",
			"request": {
				"method": "POST",
				"header": [
					{
						"key": "Content-Type",
						"value": "application/json",
						"type": "text"
					}
				],
				"body": {
					"mode": "raw",
					"raw": "{\n    \"message\": \"Tell me a joke.\",\n    \"session_id\": \"{{current_session_id}}\"\n}",
					"options": {
						"raw": {
							"language": "json"
						}
					}
				},
				"url": {
					"raw": "{{baseUrl}}/api/chat",
					"host": [
						"{{baseUrl}}"
					],
					"path": [
						"api",
						"chat"
					]
				},
				"description": "Continues an existing chat session using `current_session_id`."
			},
			"response": []
		},
		{
			"name": "Get Session History",
			"request": {
				"method": "GET",
				"header": [],
				"url": {
					"raw": "{{baseUrl}}/api/history/{{current_session_id}}",
					"host": [
						"{{baseUrl}}"
					],
					"path": [
						"api",
						"history",
						"{{current_session_id}}"
					]
				},
				"description": "Retrieves chat history for `current_session_id`."
			},
			"response": []
		},
		{
			"name": "Delete Chat Session",
			"request": {
				"method": "DELETE",
				"header": [],
				"url": {
					"raw": "{{baseUrl}}/api/session/{{current_session_id}}",
					"host": [
						"{{baseUrl}}"
					],
					"path": [
						"api",
						"session",
						"{{current_session_id}}"
					]
				},
				"description": "Deletes the chat session for `current_session_id`."
			},
			"response": []
		},
		{
			"name": "Download React App UI (ZIP)",
			"request": {
				"method": "GET",
				"header": [],
				"url": {
					"raw": "{{baseUrl}}/download/react-app",
					"host": [
						"{{baseUrl}}"
					],
					"path": [
						"download",
						"react-app"
					]
				},
				"description": "Downloads a ZIP archive of the pre-built React application UI."
			},
			"response": []
		}
	],
	"variable": [
		{
			"id": "00000000-0000-0000-0000-000000000002",
			"key": "baseUrl",
			"value": "http://localhost:8000",
			"type": "string",
			"description": "Base URL for the SRE AI Chat API"
		},
		{
			"id": "00000000-0000-0000-0000-000000000003",
			"key": "current_session_id",
			"value": "",
			"type": "string",
			"description": "Stores the session_id from the last successful chat response for continuation."
		}
	]
}

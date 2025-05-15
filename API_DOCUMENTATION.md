# Nourish Box API Documentation

This document provides details about the API endpoints for the Nourish Box application.

## Authentication

All Admin-restricted endpoints require a `userId` to be passed for authorization. The backend will verify if this `userId` belongs to an admin user.

- For `POST` requests with `FormData` (e.g., media upload), include `userId` as a field in the FormData.
- For `POST` requests with `application/json` body, include `userId` in the JSON payload.
- For `DELETE` requests, provide `userId` via one of the following methods (checked in order):
    1. `x-user-id` HTTP header.
    2. `userId` URL query parameter.
    3. `userId` in the JSON request body (if applicable, though not standard for DELETE).

## Base URL

All API endpoints are relative to the application's base URL (e.g., `http://localhost:3000/api` or `https://yourdomain.com/api`).

---

## Media Upload

### Upload Media File

- **Endpoint:** `/recipes/upload-media`
- **Method:** `POST`
- **Description:** Uploads an image or video file to Cloudinary.
- **Admin Required:** Yes
- **Request Type:** `multipart/form-data`
  - `file`: The image or video file to upload.
  - `userId`: The ID of the admin user performing the upload.
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Media uploaded successfully",
    "url": "https://res.cloudinary.com/.../image/upload/.../filename.jpg",
    "publicId": "nourish_box/recipes/filename",
    "type": "image" // or "video"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: No file provided, invalid file type.
  - `401 Unauthorized`: User ID not provided.
  - `403 Forbidden`: User is not an admin.
  - `500 Internal Server Error`: Upload failed.

---

## Recipes

### Create a New Recipe

- **Endpoint:** `/recipes`
- **Method:** `POST`
- **Description:** Creates a new recipe.
- **Admin Required:** Yes
- **Request Type:** `application/json`
  ```json
  {
    "userId": "adminUserId123",
    "name": "Delicious Pasta",
    "description": "A very tasty pasta recipe.",
    "displayMedia": {
      "url": "http://cloudinary_url/display_image.jpg",
      "publicId": "cloudinary_public_id_for_display_image",
      "type": "image" // "image" or "video"
    },
    "samples": [
      {
        "variant": "Close-up",
        "media": {
          "url": "http://cloudinary_url/sample1.jpg",
          "publicId": "cloudinary_public_id_for_sample1",
          "type": "image"
        }
      }
    ],
    "duration": 1800, // in seconds
    "price": 1500, // in Naira
    "ingredients": ["Pasta", "Tomato Sauce", "Cheese"],
    "order": 1,
    "featured": true
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Recipe created successfully",
    "recipeId": "firestoreDocumentId",
    "recipe": { /* Full recipe object including id, createdAt, updatedAt */ }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Missing required fields.
  - `401 Unauthorized`: User ID not provided.
  - `403 Forbidden`: User is not an admin.
  - `500 Internal Server Error`: Creation failed.

### Get All Recipes

- **Endpoint:** `/recipes`
- **Method:** `GET`
- **Description:** Retrieves all recipes, ordered by `order` then `createdAt`.
- **Admin Required:** No (typically, but current implementation doesn't explicitly differentiate. Assumed public for now).
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "recipes": [
      { /* Recipe object 1 */ },
      { /* Recipe object 2 */ }
      // ... more recipes
    ]
  }
  ```
- **Error Responses:**
  - `500 Internal Server Error`: Fetching failed.

### Delete a Recipe

- **Endpoint:** `/recipes/{recipeId}`
- **Method:** `DELETE`
- **Description:** Deletes a recipe and its associated media from Cloudinary.
- **Admin Required:** Yes
- **URL Parameters:**
  - `recipeId`: The ID of the recipe to delete.
- **Authorization:** `userId` (admin) required (see Authentication section).
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Recipe and associated media deleted successfully."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Recipe ID not provided.
  - `401 Unauthorized`: User ID not provided for authorization.
  - `403 Forbidden`: User is not an admin.
  - `404 Not Found`: Recipe not found.
  - `500 Internal Server Error`: Deletion failed. 
# E-Commerce Application

## Project Overview

This project is a NestJS-based e-commerce API designed to handle product management, user authentication, and various other features common in e-commerce platforms. The API allows users to browse products, while authenticated users can manage their products. Admin users have additional privileges to approve or reject products. The application is designed with performance and security optimizations in mind.

## Objectives

- **Product Management**: Users can create, update, delete, and view products.
- **User Authentication**: Secure authentication with role-based access control.
- **Admin Approval**: Admin users can approve or reject products with a reason.
- **Optimizations**: Implementation of performance and security best practices.

## Features

- **Product Management**: Add, update, and delete products.
- **User Authentication**: Register, login, and manage user sessions.
- **Role-based Access Control**: Separate roles for users and admins.
- **Product Approval Workflow**: Admins can approve or reject products submitted by users.
- **Rate Limiting**: Prevent abuse by limiting the number of requests a user can make.
- **Validation**: Strict input validation to ensure data integrity.
- **Pagination**: Efficient data retrieval with pagination.
- **Caching**: Improve performance by caching frequently accessed data.
- **Swagger Integration**: Automatically generated API documentation.

## Project Objectives

- **Scalable Architecture**: The application is designed to be easily scalable by leveraging NestJS's modular architecture.
- **Maintainability**: Clean and well-organized code, making it easy for developers to extend and maintain the project.
- **Security**: Implementation of robust security measures, including authentication, authorization, and rate limiting.

## Development Environment Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or above)
- **npm**
- **MongoDB** (as the primary database)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/devfresher/ecommerce.git
    cd e-commerce
    ```

2. Install dependencies:

    Using npm:

    ```bash
    npm install
    ```

3. Configure Environment Variables:

    1. Copy the `.env.example` file to a new `.env` file:

        ```bash
        cp .env.example .env
        ```

    2. Open the `.env` file and replace the following values:

        - `JWT_SECRET`: Replace with a secure secret key for signing JWT tokens.
        - `DB_URI`: Replace with your MongoDB connection string.
        - **Optional**: You can also change the JWT_ACCESS_EXPIRES value, which is set to 5h by default, to control how long access tokens remain valid.

        Example:

        ```bash
        NODE_ENV=development

        JWT_SECRET=your-secure-secret-key

        JWT_ACCESS_EXPIRES=5h

        DB_URI=mongodb://localhost:27017/your-db-name

        SEED_USER_AND_PRODUCTS=true
        ```

    3. Save the .env file.

### Seeds

When the application starts, an admin account is automatically seeded with the following credentials:

- **Email**: `admin@example.com`
- **Password**: `Password123`

If the SEED_USER_AND_PRODUCTS environment variable is set to 'true', a sample user will also be seeded with the following credentials:

- **Email**: `demo-user@example.com`
- **Password**: `Password123`

Along with this user, related products will also be seeded into the database.

### Running the Application Locally

1. Ensure the MongoDB instance is running either locally or on cloud

2. Run the Application:

    ```bash
    npm run start:dev
    ```

    The application will start in development mode, and you can access it at <http://localhost:3000>.

3. Access API Documentation:

    The application includes Swagger documentation. Once the application is running, you can access the API documentation at: <http://localhost:3000/api/docs>

    You can also see the postman equivalent here: <https://documenter.getpostman.com/view/32471171/2sAXjM3WZD>

## Project Structure

Here's an overview of the project structure:

```bash
src/
├── common/                # Common utilities and helpers
├── modules/               # Feature modules (e.g., auth, product, user)
│   ├── auth/              # Authentication module
│   ├── product/           # Product module
│   ├── user/              # User module
├── app.module.ts          # Root module
├── main.ts                # Entry point of the application
└── ...                    # Other configuration and utility files
```

## Key Modules

- Auth Module: Handles user authentication and authorization.
- Product Module: Manages product-related operations.
- User Module: Manages user-related operations.

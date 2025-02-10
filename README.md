# Node-Express-Prisma-Starter-Boilerplate

A production-ready Node.js Express boilerplate with TypeScript, featuring robust architecture, Prisma ORM with generic repository pattern, Object-Oriented Programming (OOP) principles, and essential integrations.

## Features

- **TypeScript Support** - Written in TypeScript for better developer experience and type safety.
- **Express.js** - Fast, unopinionated web framework for Node.js.
- **Prisma ORM** - Database access with a **Generic Repository Pattern**, following OOP principles for better maintainability and reusability.
- **Environment Configuration** - Using dotenv for environment variable management.
- **Logging** - Integrated logging system with Morgan and a custom logger.
- **Security**
  - Helmet for security headers.
  - CORS configuration.
  - Rate limiting to prevent abuse.
  - Cookie parser for handling cookies securely.
- **Redis Integration** - Redis support for caching to improve performance.
- **Error Handling** - Centralized global error handling middleware.
- **API Documentation** - Auto-generated route documentation.
- **Code Quality**
  - ESLint for code linting.
  - Prettier for code formatting.
- **Event System** - Built-in event handling system for better modularization.
- **Middleware** - Common middleware implementations:
  - Authentication middleware.
  - Error handling middleware.
  - Rate limiting middleware.
  - Pagination middleware.
  - Request validation middleware.
- **Database Seeding** - Seed initial users and test data into the database.
- **Postman Collection** - `Broilerplate.postman_collection.json` included for API testing.
- **Object-Oriented Architecture** - Designed with OOP principles, ensuring modularity, reusability, and scalability.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Redis server
- PostgreSQL or any database supported by Prisma

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd <project-name>
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Setup environment variables:**

   ```bash
   cp .env.example .env
   ```

   - Open `.env` and update the configuration as needed.

4. **Generate Prisma client:**

   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations:**

   ```bash
   npm run prisma:migrate:dev
   ```

6. **Seed the database with initial data:**

   ```bash
   npm run prisma:seed
   ```

## Project Structure

```
src/
├── app/
│   ├── middlewares/       # Express middlewares
│   ├── modules/           # Feature modules
│   ├── repository/        # Generic repository pattern for Prisma
│   ├── services/          # Service layer following OOP principles
│   ├── router.ts          # Application router
│   └── index.ts           # Express app configuration
├── config/                # Configuration files
├── shared/                # Shared utilities and helpers
├── types/                 # TypeScript type definitions
└── server.ts              # Application entry point
```

## Usage

### **Development Mode**

```bash
npm run dev
# or
yarn dev
```

### **Database Management Scripts**

- **Generate Prisma client**
  ```bash
  npm run prisma:generate
  ```
- **Run migrations (development)**
  ```bash
  npm run prisma:migrate:dev
  ```
- **Reset database**
  ```bash
  npm run prisma:db:reset
  ```
- **Open Prisma Studio**
  ```bash
  npm run prisma:studio
  ```
- **Seed database**
  ```bash
  npm run prisma:seed
  ```

## API Documentation

- The application automatically logs all available routes.
- Use the provided **Postman Collection (`Broilerplate.postman_collection.json`)** to test API endpoints.

## Error Handling

The application includes a centralized error-handling system. Any error that occurs is caught and formatted before being sent to the client, ensuring a standardized response structure.

## Security Measures

This boilerplate includes several security enhancements:

- **Helmet.js** for setting security headers.
- **Rate Limiting** to prevent excessive API requests.
- **CORS Configuration** for cross-origin security.
- **Disabled `x-powered-by` Header** to mask Express usage.
- **Request Size Limiting** to prevent large payload attacks.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`feature/your-feature` or `fix/your-fix`).
3. Commit your changes.
4. Push the branch and create a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- The Express.js team
- The TypeScript team
- Prisma ORM contributors
- Contributors to all dependencies used in this project

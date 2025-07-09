# Setup Instructions

## 1. Create a `.env` file

Create a `.env` file in the root directory of the project and add your MariaDB database credentials in the following format:
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=secret123
DB_NAME=mydatabase
DB_CONNECTION_LIMIT= X
```

## 2. Seed the database

Run the following command to seed the database with initial data:

```bash
npm run seed
```
## 3. Start the server

Start the server by running:
```bash
npm start
```

## 4. Access the application

Open your browser and go to:

```bash
http://localhost:3000
```

If you want to run the server in development mode with automatic reload on code changes, use:

```bash
npm run dev
```

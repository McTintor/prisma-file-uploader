# Folder and File Management System

A web application built using Node.js, Express.js, Prisma, and Supabase, designed to manage folders and files. Users can create folders, upload files, delete files, and organize their storage efficiently. The application also includes session-based authentication, file-sharing features, and cloud storage integration.


## Features

### User Authentication
 - Secure session-based login using Passport.js.
 - Authentication middleware ensures restricted access to authorized users.
 - Folder Management

### Create, view, and delete folders.
 - Organized structure for better storage management.

### File Management

 - Upload files to specific folders using Multer for handling file uploads.
 - Delete files, both from the database and the file system.
 - View file details, including size, and download files.

### Flash Messaging
 - Provide feedback to users for actions like successful uploads, deletions, or errors.


## Technologies Used

### Backend
 - Node.js
 - Express.js

### Database
 - Prisma ORM
 - PostgreSQL

### Authentication
 - Passport.js

### File Uploads
 - Multer for handling file uploads.

### Frontend
 - HTML5 and CSS3 for file structure and styling.
 - EJS for rendering data from the backend and handling neccecary logic.


## Folder Structure

   - controllers/ - Handles business logic for folder and file operations.
   - routes/ - Defines API endpoints for folders, files, and user authentication.
   - views/ - EJS templates for rendering HTML pages.
   - config/ - Configuration for Passport.js and database connection.
   - prisma/ - Prisma schema and database migration files.
   - public/ - Stylesheets for the application and other images.
   - uploads/ - Temporary folder for file uploads.
   - middlewares/ - Defines middleware functions used in the project.
   - app.js - Main application entry, where routers and called and server started.

     
## Installation and Setup

 - Clone the Repository

 - Clone this repository to your local machine.
   - Install Dependencies

 - Run npm install to install required packages.
   - Set Up Environment Variables

 - Create a .env file in the root directory with the following:
   - DATABASE_URL - Your PostgreSQL database connection string.

 - Run Migrations
   - Use npx prisma migrate dev to apply database migrations.
     
 - Start the Server
   - Run npm start to launch the application.

 - Access the Application
   - Navigate to http://localhost:3006 in your browser.


## Future Enhancements
 - Implement Supabase for file upload instead of using the database and local file system.
 - Add folder sharing option between users.
 - Implement search functionality for files and folders.
 - Improve error handling and logging for better debugging.
 - Add pagination for folders and files for large datasets.

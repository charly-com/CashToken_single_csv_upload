# CSV File Upload and Processing API

This Node.js application provides an API for uploading CSV files, processing them, and storing the data in a MongoDB database. The CSV file should contain entries with the headers `MSISDN`, `quantity`, and `narration`.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/) database available
- [Postman](https://www.postman.com/) or similar tool for testing the API

## Installation

1. Clone the repository:

```bash
git clone https://github.com/charly-com/CashToken_single_csv_upload
Install dependencies:
bash
Copy code
cd <project-folder>
npm install
Configure MongoDB:

Create a MongoDB Atlas account or set up a local MongoDB instance.
Replace the MongoDB connection string in app.js with your own.
Usage
Start the application:

bash
Copy code
npm start
The server will be running on http://localhost:3000.

API Endpoints
POST /upload: Uploads a CSV file, processes it, and saves the entries to the MongoDB database.

Request:

Method: POST
Endpoint: /upload
Form Data: csvFile (CSV file)
Response:

Status 200: File uploaded and entries saved to the database.
Status 400: No file uploaded.
Status 500: Error processing the file.
Configuration
MongoDB Connection: Update the MongoDB connection string in app.js.
Contributing
Contributions are welcome! Please follow the contribution guidelines.

License
This project is licensed under the MIT License.
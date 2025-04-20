CSV to JSON Converter API
This application converts CSV files to JSON objects and stores them in a PostgreSQL database. Each row in the CSV file represents one object and a file with multiple rows is converted to a list of objects.
Features

Convert CSV files to JSON
Parse complex nested properties with dot notation
Store data in PostgreSQL with proper schema mapping
Generate age distribution reports

Requirements

Node.js (v14+)
PostgreSQL database

Installation

Clone this repository
Install dependencies:
npm install

Configure the application by creating a .env file based on the provided sample

Configuration
Set the following environment variables in a .env file:
# Server configuration
PORT=3000

# Database configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=csvconverter
DB_USER=postgres
DB_PASSWORD=postgres

# CSV file location
CSV_FILE_PATH=./data/users.csv
Database Setup
The application will automatically create the required table with the following structure:

CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  age INT NOT NULL,
  address JSONB NULL,
  additional_info JSONB NULL
);


Usage

Start the application:

npm start

Process a CSV file via the API:
GET /api/process-file?filePath=/path/to/your/file.csv
If no file path is provided, it will use the path from the configuration.
View age distribution:
GET /api/age-distribution


CSV File Format
The CSV file should have the following mandatory fields:

name.firstName
name.lastName
age

Example:
name.firstName, name.lastName, age, address.line1, address.line2, address.city, address.state, gender
Rohit, Prasad, 35, A-563 Rakshak Society, New Pune Road, Pune, Maharashtra, male

Assumptions


The CSV file has a header row with property names
All property names use dot notation for nesting
All sub-properties of a complex property are placed next to each other in the file
The PostgreSQL database is already set up and accessible
The application handles only CSV files with comma separators
The application performs basic data validation but expects proper CSV formatting

Performance Considerations

The application uses streaming for parsing large CSV files to minimize memory usage
Batch processing is implemented for database operations to improve performance
Error handling is in place to gracefully handle issues with file parsing or database operations

Screenshots of API testing using Postman are attached.

![Screenshot (77)](https://github.com/user-attachments/assets/c64434b5-6aed-4df8-9531-edf5b2fe80e8)
![Screenshot (78)](https://github.com/user-attachments/assets/50bcaf45-a60d-490f-b03e-f4174b744e5e)
![Screenshot (79)](https://github.com/user-attachments/assets/ded963e8-46ea-4f19-bcb6-cf3f1ad66d57)

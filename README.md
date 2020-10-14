# ESTL TAP 2021 Assesment (Back End)

## Requirements

- node 12.18.0
- npm 6.14.x
- MySQL 5.7

Populate the `.env` file with your MySQL database first.

## Installation

### `npm install`

## Available Scripts

### `npm start`

Runs the express server

### `npm test`

Launches the mocha test runner

## Database

### Database Structure

The database structure follows

- id - VARCHAR(15), Unique, Not null
- login - VARCHAR(45), PK, Unique, Not null
- name - VARCHAR(15), Not null
- salary - DECIMAL(10,2), Not null, Unsigned

### Create ESTL Users Table

Create statement is as follows

```
CREATE TABLE `users` (
  `id` varchar(15) NOT NULL,
  `login` varchar(45) NOT NULL,
  `name` varchar(45) NOT NULL,
  `salary` decimal(10,2) unsigned NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`login`),
  UNIQUE KEY `login_UNIQUE` (`login`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
```

### Assumptions

This assumes a limit of

- 15 chars for id
- 45 chars for login
- 15 chars for name
- salary is less than 2^10

However, they can be scaled up to suit the needs of the dashboard.

## Issues/etc

### Database

The database is an AWS RDS instance, running MySQL 5.7. I have created a temp user that perform fundamental actions on my instance for your east of testing

### Test Cases

I would have liked to implement more test cases for `crudUser.js`, but due to time constrain, I did not manage to do that.

### .csv sample files

I have included some sample files to test via the upload endpoint and check the rejection accordingly.

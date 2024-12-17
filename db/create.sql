DROP DATABASE diplomaDB;

CREATE DATABASE diplomaDB;
USE diplomaDB;

CREATE TABLE IF NOT EXISTS user (
username VARCHAR(255),
password VARCHAR(255) NOT NULL,

PRIMARY KEY (username)
);

CREATE TABLE IF NOT EXISTS professor (
username VARCHAR(255),
password VARCHAR(255) NOT NULL,
name VARCHAR(50),
surname VARCHAR(50),
email VARCHAR(30),
topic VARCHAR(255),
landline INT,
mobile INT,
department VARCHAR(50),
university VARCHAR(50),

PRIMARY KEY (username),
CONSTRAINT prof_username
FOREIGN KEY (username)
REFERENCES user(username)
ON DELETE CASCADE ON UPDATE CASCADE,

CONSTRAINT prof_pass
FOREIGN KEY (password)
REFERENCES user(password)
ON DELETE CASCADE ON UPDATE CASCADE
);
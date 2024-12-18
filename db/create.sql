CREATE DATABASE IF NOT EXISTS diplomaDB;
USE diplomaDB;

DROP TABLE IF EXISTS professor;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS secretary;
DROP TABLE IF EXISTS user;

CREATE TABLE IF NOT EXISTS user (
id INT,
username VARCHAR(255),
password VARCHAR(255) NOT NULL,
name VARCHAR(50),
surname VARCHAR(50),
email VARCHAR(30),
landline INT,
mobile INT,
role ENUM('student','professor','secretary') NOT NULL,

PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS professor (
id INT,
topic VARCHAR(255),
department VARCHAR(50),
university VARCHAR(50),

PRIMARY KEY (id),
CONSTRAINT prof_id
FOREIGN KEY (id)
REFERENCES user(id)
ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS student (
id INT,
student_number INT,
street VARCHAR(50),
street_number INT,
city VARCHAR(50),
postcode INT,
father_name VARCHAR(50),

PRIMARY KEY (id),
CONSTRAINT student_id
FOREIGN KEY (id)
REFERENCES user(id)
ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS secretary (
id INT,

PRIMARY KEY (id),
CONSTRAINT secretary_id
FOREIGN KEY (id)
REFERENCES user(id)
ON DELETE CASCADE ON UPDATE CASCADE
);
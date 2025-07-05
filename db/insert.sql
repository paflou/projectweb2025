-- Insert statements for the 'user' table with IDs in thousands
INSERT INTO user (id, username, password, name, surname, email, landline, mobile, role) VALUES
(10001, 'jdoe_prof', 'pass123', 'John', 'Doe', 'john.doe@example.com', '2101234567', '6901234567', 'professor'),
(10002, 'asmith_prof', 'securepwd', 'Anna', 'Smith', 'anna.smith@example.com', '2109876543', '6909876543', 'professor'),
(10003, 'pbrown_prof', 'mysecret', 'Peter', 'Brown', 'peter.brown@example.com', '2105551234', '6905551234', 'professor'),
(20001, 'ali_stud', 'studentpass', 'Alice', 'Li', 'alice.li@example.com', NULL, '6971112222', 'student'),
(20002, 'bchan_stud', 'mystudent', 'Bob', 'Chan', 'bob.chan@example.com', NULL, '6983334444', 'student'),
(20003, 'csingh_stud', 'securestud', 'Carol', 'Singh', 'carol.singh@example.com', NULL, '6995556666', 'student'),
(30001, 'mwhite_sec', 'secpass', 'Maria', 'White', 'maria.white@example.com', '2107778888', '6947778888', 'secretary');

-- Insert statements for the 'professor' table with updated IDs
INSERT INTO professor (id, topic, department, university) VALUES
(10001, 'Artificial Intelligence', 'Computer Science', 'University of Athens'),
(10002, 'Database Systems', 'Informatics', 'National Technical University of Athens'),
(10003, 'Network Security', 'Electrical Engineering', 'Aristotle University of Thessaloniki');

-- Insert statements for the 'student' table with updated IDs
INSERT INTO student (id, student_number, street, street_number, city, postcode, father_name) VALUES
(20001, 1001, 'Main St', 10, 'Athens', 10500, 'David Li'),
(20002, 1002, 'Oak Ave', 25, 'Thessaloniki', 54600, 'Michael Chan'),
(20003, 1003, 'Pine Blvd', 7, 'Patras', 26221, 'Rajesh Singh');

-- Insert statement for the 'secretary' table with updated ID
INSERT INTO secretary (id) VALUES
(30001);

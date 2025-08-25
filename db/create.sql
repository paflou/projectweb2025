DROP DATABASE IF EXISTS diplomaDB;
CREATE DATABASE IF NOT EXISTS diplomaDB;

USE diplomaDB;

CREATE TABLE
    IF NOT EXISTS user (
        id INT,
        username VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        name VARCHAR(50),
        surname VARCHAR(50),
        email VARCHAR(30),
        landline BIGINT,
        mobile BIGINT,
        role ENUM ('student', 'professor', 'secretary') NOT NULL,
        PRIMARY KEY (id)
    );

CREATE TABLE
    IF NOT EXISTS professor (
        id INT,
        topic VARCHAR(255),
        department VARCHAR(250),
        university VARCHAR(250),
        PRIMARY KEY (id),
        CONSTRAINT prof_id FOREIGN KEY (id) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS student (
        id INT,
        student_number INT,
        street VARCHAR(50),
        street_number INT,
        city VARCHAR(50),
        postcode INT,
        father_name VARCHAR(50),
        PRIMARY KEY (id),
        CONSTRAINT student_id FOREIGN KEY (id) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS secretary (
        id INT,
        PRIMARY KEY (id),
        CONSTRAINT secretary_id FOREIGN KEY (id) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS thesis (
        id INT AUTO_INCREMENT,
        supervisor_id INT NOT NULL,
        member1_id INT,
        member2_id INT,
        student_id INT,
        title VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        pdf TEXT,
        thesis_status ENUM ('under-assignment', 'active', 'under-review', 'completed', 'canceled') NOT NULL DEFAULT 'under-assignment',
        grade DECIMAL(4, 2) CHECK (
            grade >= 0
            AND grade <= 10
        ),
        PRIMARY KEY (id),
        CONSTRAINT thesis_supervisor FOREIGN KEY (supervisor_id) REFERENCES professor (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT thesis_member1 FOREIGN KEY (member1_id) REFERENCES professor (id) ON DELETE SET NULL ON UPDATE SET NULL,
        CONSTRAINT thesis_member2 FOREIGN KEY (member2_id) REFERENCES professor (id) ON DELETE SET NULL ON UPDATE SET NULL,
        CONSTRAINT thesis_student FOREIGN KEY (student_id) REFERENCES student (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS committee_invitation (
        id INT AUTO_INCREMENT,
        thesis_id INT NOT NULL,
        professor_id INT NOT NULL,
        status ENUM ('pending', 'accepted', 'rejected') DEFAULT 'pending',
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT invitation_thesis FOREIGN KEY (thesis_id) REFERENCES thesis (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT invitation_professor FOREIGN KEY (professor_id) REFERENCES professor (id) ON DELETE CASCADE ON UPDATE CASCADE
    );


   DROP TRIGGER IF EXISTS update_thesis_status_on_acceptance;

   CREATE TRIGGER update_thesis_status_on_acceptance
AFTER UPDATE ON committee_invitation
FOR EACH ROW
BEGIN
    DECLARE accepted_count INT;
    -- Only proceed if status changed to 'accepted'
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        -- Count accepted invitations for this thesis
        SELECT COUNT(*) INTO accepted_count
        FROM committee_invitation 
        WHERE thesis_id = NEW.thesis_id AND status = 'accepted';
        -- If we now have 2 accepted members, update thesis status and cancel pending invitations
        IF accepted_count = 2 THEN
            -- Update thesis status to 'active'
            UPDATE thesis 
            SET thesis_status = 'active' 
            WHERE id = NEW.thesis_id AND thesis_status = 'under-assignment';

        END IF;
    END IF;
END;
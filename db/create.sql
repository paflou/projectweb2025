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

CREATE TABLE IF NOT EXISTS thesis (
    id INT AUTO_INCREMENT,
    supervisor_id INT NOT NULL,
    member1_id INT,
    member2_id INT,
    student_id  INT UNIQUE,
    title VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    
    -- Professor-uploaded PDF
    pdf TEXT,
    
    -- Student-submitted draft
    draft TEXT,
    
    -- Exam scheduling info
    exam_datetime DATETIME,
    exam_mode ENUM('in-person', 'online'),
    exam_location TEXT,
    
    -- Final repository link (nemertes)
    final_repository_link TEXT,
    
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    thesis_status ENUM('under-assignment', 'active', 'under-review', 'completed', 'canceled') NOT NULL DEFAULT 'under-assignment',
    
    -- Grade between 0 and 10, with two decimal places
    grade DECIMAL(4, 2) CHECK (grade >= 0 AND grade <= 10),
    
    grading_enabled BOOLEAN DEFAULT FALSE,


    -- Secretary management fields
    ap_number VARCHAR(50), -- AP number from General Assembly for topic assignment approval
    ap_year YEAR, -- Year of the General Assembly decision
    cancellation_ap_number VARCHAR(50), -- AP number for cancellation decision
    cancellation_ap_year YEAR, -- Year of cancellation decision
    cancellation_reason TEXT, -- Reason for cancellation (free text)
    cancellation_date TIMESTAMP NULL, -- Date when cancellation was recorded

    PRIMARY KEY (id),
    
    -- Foreign keys
    CONSTRAINT thesis_supervisor FOREIGN KEY (supervisor_id) REFERENCES professor(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT thesis_member1 FOREIGN KEY (member1_id) REFERENCES professor(id) ON DELETE SET NULL ON UPDATE SET NULL,
    CONSTRAINT thesis_member2 FOREIGN KEY (member2_id) REFERENCES professor(id) ON DELETE SET NULL ON UPDATE SET NULL,
    CONSTRAINT thesis_student FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS thesis_grades (
    id INT AUTO_INCREMENT,
    thesis_id INT NOT NULL,
    professor_id INT NOT NULL,
    
    -- Four criteria (0-10 each)
    criterion1 DECIMAL(4, 2) NOT NULL CHECK (criterion1 >= 0 AND criterion1 <= 10),
    criterion2 DECIMAL(4, 2) NOT NULL CHECK (criterion2 >= 0 AND criterion2 <= 10),
    criterion3 DECIMAL(4, 2) NOT NULL CHECK (criterion3 >= 0 AND criterion3 <= 10),
    criterion4 DECIMAL(4, 2) NOT NULL CHECK (criterion4 >= 0 AND criterion4 <= 10),
    
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),

    -- Prevent the same professor from grading the same thesis twice
    UNIQUE (thesis_id, professor_id),

    FOREIGN KEY (thesis_id) REFERENCES thesis(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES professor(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS additional_thesis_material (
    id INT AUTO_INCREMENT PRIMARY KEY,
    thesis_id INT NOT NULL,
    url VARCHAR(2083) NOT NULL,
    FOREIGN KEY (thesis_id) REFERENCES thesis(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS thesis_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    thesis_id INT NOT NULL,
    user_id INT,
    user_role ENUM('student','supervisor', 'member','secretary'),
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT log_thesis_fk FOREIGN KEY (thesis_id) REFERENCES thesis(id) ON DELETE CASCADE,
    CONSTRAINT log_user_fk FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE
    IF NOT EXISTS committee_invitation (
        id INT AUTO_INCREMENT,
        thesis_id INT NOT NULL,
        professor_id INT NOT NULL,
        status ENUM ('pending', 'accepted', 'rejected') DEFAULT 'pending',
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        replied_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        PRIMARY KEY (id),
        CONSTRAINT invitation_thesis FOREIGN KEY (thesis_id) REFERENCES thesis (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT invitation_professor FOREIGN KEY (professor_id) REFERENCES professor (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE IF NOT EXISTS professor_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    thesis_id INT NOT NULL,
    professor_id INT,
    note VARCHAR(300),
    
    CONSTRAINT professor_fk FOREIGN KEY (professor_id) REFERENCES professor(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT thesis_fk FOREIGN KEY (thesis_id) REFERENCES thesis(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS thesis_announcement (
    id INT AUTO_INCREMENT,
    thesis_id INT NOT NULL UNIQUE,
    announcement_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    
    -- Foreign key to thesis
    CONSTRAINT announcement_thesis FOREIGN KEY (thesis_id)
        REFERENCES thesis(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TRIGGER check_professor_allowed
BEFORE INSERT ON thesis_grades
FOR EACH ROW
BEGIN
    DECLARE allowed_count INT;

    SELECT COUNT(*) INTO allowed_count
    FROM thesis
    WHERE id = NEW.thesis_id
      AND (supervisor_id = NEW.professor_id
           OR member1_id = NEW.professor_id
           OR member2_id = NEW.professor_id);

    IF allowed_count = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Professor is not allowed to grade this thesis';
    END IF;
END;

CREATE TRIGGER log_thesis_creation
AFTER INSERT ON thesis
FOR EACH ROW
BEGIN
    INSERT INTO thesis_log (thesis_id, user_id, user_role, action)
    VALUES (NEW.id, NEW.supervisor_id, 'supervisor', 'created');
END;

CREATE TRIGGER log_thesis_change
AFTER UPDATE ON thesis
FOR EACH ROW
BEGIN
    -- Declare variables for logging
    DECLARE action_type VARCHAR(50);
    DECLARE user_role VARCHAR(20);
    DECLARE user_id INT;

    -- Initialize variables to NULL for system actions
    SET user_id = NULL;
    SET user_role = NULL;

    -- Assignment changes: student assigned to thesis
    IF OLD.student_id IS NULL AND NEW.student_id IS NOT NULL THEN
        SET action_type = 'assigned';
        SET user_role = 'supervisor';
        SET user_id = NEW.supervisor_id;

    -- Cancellation of assignment: student removed from thesis
    ELSEIF OLD.student_id IS NOT NULL AND NEW.student_id IS NULL THEN
        SET action_type = 'assignment_cancelled';
        SET user_role = 'supervisor';
        SET user_id = NEW.supervisor_id;

    -- Committee member 1 left
    ELSEIF OLD.member1_id IS NOT NULL AND NEW.member1_id IS NULL THEN
        SET action_type = 'member_left';
        SET user_role = 'member';
        SET user_id = OLD.member1_id;

    -- Committee member 2 left
    ELSEIF OLD.member2_id IS NOT NULL AND NEW.member2_id IS NULL THEN
        SET action_type = 'member_left';
        SET user_role = 'member';
        SET user_id = OLD.member2_id;

    -- Thesis status changed (active, canceled, completed)
    ELSEIF OLD.thesis_status != NEW.thesis_status THEN
        IF NEW.thesis_status = 'active' THEN
            SET action_type = 'active';
        ELSEIF NEW.thesis_status = 'canceled' THEN
            SET action_type = 'canceled';
        ELSEIF NEW.thesis_status = 'completed' THEN
            SET action_type = 'completed';
        END IF;

    -- Student uploaded/updated draft PDF
    ELSEIF NOT(OLD.draft <=> NEW.draft) THEN
        SET action_type = 'draft_updated';
        SET user_role = 'student';
        SET user_id = NEW.student_id;

    -- Exam scheduled or rescheduled
    ELSEIF NOT(OLD.exam_datetime <=> NEW.exam_datetime) THEN
        SET action_type = 'exam_scheduled';
        SET user_role = 'student';
        SET user_id = NEW.student_id;

    -- Supervisor submitted grade
    ELSEIF OLD.grade != NEW.grade THEN
        SET action_type = 'grade_submitted';
        SET user_role = 'supervisor';
        SET user_id = NEW.supervisor_id;

    -- No relevant change detected
    ELSE
        SET action_type = NULL;
    END IF;

    -- Insert log entry if an action was determined
    IF action_type IS NOT NULL THEN
        INSERT INTO thesis_log (thesis_id, user_id, user_role, action)
        VALUES (NEW.id, user_id, user_role, action_type);
    END IF;
END;


CREATE TRIGGER log_invitation_sent
AFTER INSERT ON committee_invitation
FOR EACH ROW
BEGIN
    INSERT INTO thesis_log (thesis_id, user_id, user_role, action)
    VALUES (NEW.thesis_id, NEW.professor_id, 'student', 'invitation_sent');
END;

CREATE TRIGGER log_invitation_status_change
AFTER UPDATE ON committee_invitation
FOR EACH ROW
BEGIN
    -- Only act if the status has actually changed
    IF NEW.status <> OLD.status THEN
        IF NEW.status = 'accepted' THEN
            INSERT INTO thesis_log (thesis_id, user_id, user_role, action)
            VALUES (NEW.thesis_id, NEW.professor_id, 'member', 'Invitation_accepted');
        ELSEIF NEW.status = 'rejected' THEN
            INSERT INTO thesis_log (thesis_id, user_id, user_role, action)
            VALUES (NEW.thesis_id, NEW.professor_id, 'member', 'Invitation_declined');
        END IF;
    END IF;
END;

-- Trigger to update thesis status and cancel pending invitations when two committee members accept
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

CREATE TRIGGER update_thesis_final_grade
AFTER INSERT ON thesis_grades
FOR EACH ROW
BEGIN
    DECLARE grade_count INT;

    -- Count how many professors have graded this thesis
    SELECT COUNT(DISTINCT professor_id) INTO grade_count
    FROM thesis_grades
    WHERE thesis_id = NEW.thesis_id;

    -- Only update the thesis grade if 3 professors have graded
    IF grade_count = 3 THEN
        UPDATE thesis
        SET grade = (
            SELECT AVG(
                criterion1 * 0.60 +
                criterion2 * 0.15 +
                criterion3 * 0.15 +
                criterion4 * 0.10
            )
            FROM thesis_grades
            WHERE thesis_id = NEW.thesis_id
        )
        WHERE id = NEW.thesis_id;
    END IF;
END;
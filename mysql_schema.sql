/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.0.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: diplomaDB
-- ------------------------------------------------------
-- Server version	12.0.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `additional_thesis_material`
--

DROP TABLE IF EXISTS `additional_thesis_material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `additional_thesis_material` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `thesis_id` int(11) NOT NULL,
  `url` varchar(2083) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `thesis_id` (`thesis_id`),
  CONSTRAINT `additional_thesis_material_ibfk_1` FOREIGN KEY (`thesis_id`) REFERENCES `thesis` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `committee_invitation`
--

DROP TABLE IF EXISTS `committee_invitation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `committee_invitation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `thesis_id` int(11) NOT NULL,
  `professor_id` int(11) NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `sent_at` datetime DEFAULT current_timestamp(),
  `replied_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `invitation_thesis` (`thesis_id`),
  KEY `invitation_professor` (`professor_id`),
  CONSTRAINT `invitation_professor` FOREIGN KEY (`professor_id`) REFERENCES `professor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `invitation_thesis` FOREIGN KEY (`thesis_id`) REFERENCES `thesis` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`paflou`@`localhost`*/ /*!50003 TRIGGER log_invitation_sent
AFTER INSERT ON committee_invitation
FOR EACH ROW
BEGIN
    INSERT INTO thesis_log (thesis_id, user_id, user_role, action)
    VALUES (NEW.thesis_id, NEW.professor_id, 'student', 'invitation_sent');
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`paflou`@`localhost`*/ /*!50003 TRIGGER log_invitation_status_change
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`paflou`@`localhost`*/ /*!50003 TRIGGER update_thesis_status_on_acceptance
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `professor`
--

DROP TABLE IF EXISTS `professor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `professor` (
  `id` int(11) NOT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `department` varchar(250) DEFAULT NULL,
  `university` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `prof_id` FOREIGN KEY (`id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `professor_notes`
--

DROP TABLE IF EXISTS `professor_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `professor_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `thesis_id` int(11) NOT NULL,
  `professor_id` int(11) DEFAULT NULL,
  `note` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `professor_fk` (`professor_id`),
  KEY `thesis_fk` (`thesis_id`),
  CONSTRAINT `professor_fk` FOREIGN KEY (`professor_id`) REFERENCES `professor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `thesis_fk` FOREIGN KEY (`thesis_id`) REFERENCES `thesis` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `secretary`
--

DROP TABLE IF EXISTS `secretary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `secretary` (
  `id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `secretary_id` FOREIGN KEY (`id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `id` int(11) NOT NULL,
  `student_number` int(11) DEFAULT NULL,
  `street` varchar(50) DEFAULT NULL,
  `street_number` int(11) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `postcode` int(11) DEFAULT NULL,
  `father_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `student_id` FOREIGN KEY (`id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `thesis`
--

DROP TABLE IF EXISTS `thesis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `thesis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supervisor_id` int(11) NOT NULL,
  `member1_id` int(11) DEFAULT NULL,
  `member2_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `pdf` text DEFAULT NULL,
  `draft` text DEFAULT NULL,
  `report` text DEFAULT NULL,
  `exam_datetime` datetime DEFAULT NULL,
  `exam_mode` enum('in-person','online') DEFAULT NULL,
  `exam_location` text DEFAULT NULL,
  `final_repository_link` text DEFAULT NULL,
  `submission_date` timestamp NULL DEFAULT current_timestamp(),
  `thesis_status` enum('under-assignment','active','under-review','completed','canceled') NOT NULL DEFAULT 'under-assignment',
  `grade` decimal(4,2) DEFAULT NULL CHECK (`grade` >= 0 and `grade` <= 10),
  `grading_enabled` tinyint(1) DEFAULT 0,
  `ap_number` varchar(50) DEFAULT NULL,
  `ap_year` year(4) DEFAULT NULL,
  `cancellation_ap_number` varchar(50) DEFAULT NULL,
  `cancellation_ap_year` year(4) DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `cancellation_date` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`),
  UNIQUE KEY `student_id` (`student_id`),
  KEY `thesis_supervisor` (`supervisor_id`),
  KEY `thesis_member1` (`member1_id`),
  KEY `thesis_member2` (`member2_id`),
  CONSTRAINT `thesis_member1` FOREIGN KEY (`member1_id`) REFERENCES `professor` (`id`) ON DELETE SET NULL ON UPDATE SET NULL,
  CONSTRAINT `thesis_member2` FOREIGN KEY (`member2_id`) REFERENCES `professor` (`id`) ON DELETE SET NULL ON UPDATE SET NULL,
  CONSTRAINT `thesis_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `thesis_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `professor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`paflou`@`localhost`*/ /*!50003 TRIGGER log_thesis_creation
AFTER INSERT ON thesis
FOR EACH ROW
BEGIN
    INSERT INTO thesis_log (thesis_id, user_id, user_role, action)
    VALUES (NEW.id, NEW.supervisor_id, 'supervisor', 'created');
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`paflou`@`localhost`*/ /*!50003 TRIGGER log_thesis_change
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `thesis_announcement`
--

DROP TABLE IF EXISTS `thesis_announcement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `thesis_announcement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `thesis_id` int(11) NOT NULL,
  `announcement_text` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `thesis_id` (`thesis_id`),
  CONSTRAINT `announcement_thesis` FOREIGN KEY (`thesis_id`) REFERENCES `thesis` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `thesis_grades`
--

DROP TABLE IF EXISTS `thesis_grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `thesis_grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `thesis_id` int(11) NOT NULL,
  `professor_id` int(11) NOT NULL,
  `criterion1` decimal(4,2) NOT NULL CHECK (`criterion1` >= 0 and `criterion1` <= 10),
  `criterion2` decimal(4,2) NOT NULL CHECK (`criterion2` >= 0 and `criterion2` <= 10),
  `criterion3` decimal(4,2) NOT NULL CHECK (`criterion3` >= 0 and `criterion3` <= 10),
  `criterion4` decimal(4,2) NOT NULL CHECK (`criterion4` >= 0 and `criterion4` <= 10),
  `submitted_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `thesis_id` (`thesis_id`,`professor_id`),
  KEY `professor_id` (`professor_id`),
  CONSTRAINT `thesis_grades_ibfk_1` FOREIGN KEY (`thesis_id`) REFERENCES `thesis` (`id`) ON DELETE CASCADE,
  CONSTRAINT `thesis_grades_ibfk_2` FOREIGN KEY (`professor_id`) REFERENCES `professor` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`paflou`@`localhost`*/ /*!50003 TRIGGER check_professor_allowed
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`paflou`@`localhost`*/ /*!50003 TRIGGER update_thesis_final_grade
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `thesis_log`
--

DROP TABLE IF EXISTS `thesis_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `thesis_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `thesis_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_role` enum('student','supervisor','member','secretary') DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `log_thesis_fk` (`thesis_id`),
  KEY `log_user_fk` (`user_id`),
  CONSTRAINT `log_thesis_fk` FOREIGN KEY (`thesis_id`) REFERENCES `thesis` (`id`) ON DELETE CASCADE,
  CONSTRAINT `log_user_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `surname` varchar(50) DEFAULT NULL,
  `email` varchar(30) DEFAULT NULL,
  `landline` bigint(20) DEFAULT NULL,
  `mobile` bigint(20) DEFAULT NULL,
  `role` enum('student','professor','secretary') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-09-20 21:57:02

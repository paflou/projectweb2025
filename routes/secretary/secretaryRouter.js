const express = require("express");
const router = express.Router();
const path = require("path");
const checkPermission = require("../../middlewares/checkPermission");
const pool = require("../../db/db"); // must be mysql2/promise

// Serve pages
router.get("/", checkPermission('secretary'), (req, res) =>
  res.sendFile(path.join(__dirname, "../../public/secretary/secretary.html"))
);

router.get("/view_thesis", checkPermission("secretary"), (req, res) =>
  res.sendFile(path.join(__dirname, "../../public/secretary/view_thesis.html"))
);

router.get("/input", checkPermission("secretary"), (req, res) => 
  res.sendFile(path.join(__dirname, "../../public/secretary/input.html"))
);

// Fetch list of active or under-review theses (id + title only)
router.get("/get-thesis", checkPermission("secretary"), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, title
      FROM thesis
      WHERE thesis_status IN ('active', 'under-review')
      ORDER BY submission_date DESC
    `);
    res.json({ info: rows || [] });
  } catch (err) {
    console.error("Error fetching theses:", err);
    res.status(500).json({ error: "Σφάλμα κατά τη φόρτωση διπλωματικών" });
  }
});

// Fetch only names/details for a specific thesis.id
router.get("/get-thesis/:id", checkPermission("secretary"), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.id, t.title, t.description, t.thesis_status, t.submission_date,
        sup.first_name AS supervisor_first, sup.last_name AS supervisor_last,
        m1.first_name AS member1_first, m1.last_name AS member1_last,
        m2.first_name AS member2_first, m2.last_name AS member2_last,
        st.first_name AS student_first, st.last_name AS student_last
      FROM thesis t
      LEFT JOIN users sup ON t.supervisor_id = sup.id
      LEFT JOIN users m1 ON t.member1_id = m1.id
      LEFT JOIN users m2 ON t.member2_id = m2.id
      LEFT JOIN users st ON t.student_id = st.id
      WHERE t.id = ?
    `, [req.params.id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Δεν βρέθηκε η διπλωματική" });
    }

    // Only send the names in a clean format
    const t = rows[0];
    res.json({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.thesis_status,
      submission_date: t.submission_date,
      supervisor_name: t.supervisor_first && t.supervisor_last ? `${t.supervisor_first} ${t.supervisor_last}` : null,
      member1_name: t.member1_first && t.member1_last ? `${t.member1_first} ${t.member1_last}` : null,
      member2_name: t.member2_first && t.member2_last ? `${t.member2_first} ${t.member2_last}` : null,
      student_name: t.student_first && t.student_last ? `${t.student_first} ${t.student_last}` : null
    });const express = require("express");
const router = express.Router();
const path = require("path");
const checkPermission = require("../../middlewares/checkPermission");
const pool = require("../../db/db"); // must be mysql2/promise

// Serve pages
router.get("/", checkPermission('secretary'), (req, res) =>
  res.sendFile(path.join(__dirname, "../../public/secretary/secretary.html"))
);

router.get("/view_thesis", checkPermission("secretary"), (req, res) =>
  res.sendFile(path.join(__dirname, "../../public/secretary/view_thesis.html"))
);

// Fetch list of active or under-review theses (id + title only)
router.get("/get-thesis", checkPermission("secretary"), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, title
      FROM thesis
      WHERE thesis_status IN ('active', 'under-review')
      ORDER BY submission_date DESC
    `);
    res.json({ info: rows || [] });
  } catch (err) {
    console.error("Error fetching theses:", err);
    res.status(500).json({ error: "Σφάλμα κατά τη φόρτωση διπλωματικών" });
  }
});

// Fetch details for a specific thesis by ID
router.get("/get-thesis/:id", checkPermission("secretary"), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.id, t.title, t.description, t.thesis_status, t.submission_date,
        sup.name AS supervisor_name, sup.surname AS supervisor_surname,
        m1.name AS member1_name, m1.surname AS member1_surname,
        m2.name AS member2_name, m2.surname AS member2_surname,
        st.name AS student_name, st.surname AS student_surname
      FROM thesis t
      LEFT JOIN user sup ON t.supervisor_id = sup.id
      LEFT JOIN user m1 ON t.member1_id = m1.id
      LEFT JOIN user m2 ON t.member2_id = m2.id
      LEFT JOIN user st ON t.student_id = st.id
      WHERE t.id = ?
    `, [req.params.id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Δεν βρέθηκε η διπλωματική" });
    }

    const t = rows[0];
    res.json({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.thesis_status,
      submission_date: t.submission_date,
      supervisor_name: t.supervisor_name && t.supervisor_surname ? `${t.supervisor_name} ${t.supervisor_surname}` : null,
      member1_name: t.member1_name && t.member1_surname ? `${t.member1_name} ${t.member1_surname}` : null,
      member2_name: t.member2_name && t.member2_surname ? `${t.member2_name} ${t.member2_surname}` : null,
      student_name: t.student_name && t.student_surname ? `${t.student_name} ${t.student_surname}` : null
    });
  } catch (err) {
    console.error("Error fetching thesis details:", err);
    res.status(500).json({ error: "Σφάλμα κατά τη φόρτωση λεπτομερειών" });
  }
});

  } catch (err) {
    console.error("Error fetching thesis details:", err);
    res.status(500).json({ error: "Σφάλμα κατά τη φόρτωση λεπτομερειών" });
  }
});

router.post("/upload-json", checkPermission("secretary"), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const data = req.body;
    await connection.beginTransaction();

    // Students
    if (Array.isArray(data.students)) {
      for (const student of data.students) {
        const username = student.username || student.email.split('@')[0];

        // user table
        await connection.query(
          `INSERT INTO user (id, username, password, name, surname, email, landline, mobile, role)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'student')
           ON DUPLICATE KEY UPDATE 
             username = VALUES(username), name = VALUES(name), surname = VALUES(surname),
             email = VALUES(email), landline = VALUES(landline), mobile = VALUES(mobile)`,
          [
            student.id,
            username,
            '123',
            student.name,
            student.surname,
            student.email,
            student.landline_telephone,
            student.mobile_telephone
          ]
        );

        // student table
        await connection.query(
          `INSERT INTO student (id, student_number, street, street_number, city, postcode, father_name)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             student_number = VALUES(student_number), street = VALUES(street),
             street_number = VALUES(street_number), city = VALUES(city),
             postcode = VALUES(postcode), father_name = VALUES(father_name)`,
          [
            student.id,
            student.student_number,
            student.street,
            student.street_number,
            student.city,
            student.postcode,
            student.father_name
          ]
        );
      }
    }

    // Professors
    if (Array.isArray(data.professors)) {
      for (const prof of data.professors) {
        const username = prof.username || prof.email.split('@')[0];

        // user table
        await connection.query(
          `INSERT INTO user (id, username, password, name, surname, email, landline, mobile, role)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'professor')
           ON DUPLICATE KEY UPDATE 
             username = VALUES(username), name = VALUES(name), surname = VALUES(surname),
             email = VALUES(email), landline = VALUES(landline), mobile = VALUES(mobile)`,
          [
            prof.id,
            username,
            '123',
            prof.name,
            prof.surname,
            prof.email,
            prof.landline_telephone || null,
            prof.mobile_telephone || null
          ]
        );

        // professor table
        await connection.query(
          `INSERT INTO professor (id, topic, department, university)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             topic = VALUES(topic), department = VALUES(department), university = VALUES(university)`,
          [
            prof.id,
            prof.topic || null,
            prof.department || null,
            prof.university || null
          ]
        );
      }
    }

    await connection.commit();
    res.json({ message: "Επιτυχής εισαγωγή φοιτητών και καθηγητών από JSON" });
  } catch (err) {
    await connection.rollback();
    console.error("Error importing JSON:", err);
    res.status(500).json({ error: "Σφάλμα κατά την εισαγωγή" });
  } finally {
    connection.release();
  }
});




module.exports = router;

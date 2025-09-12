const pool = require('../../db/db');

/**
 * Service for importing student and instructor data from JSON files
 */

/**
 * Validates the structure of the imported JSON data
 * @param {Object} data - The parsed JSON data
 * @returns {Object} - Validation result with success flag and errors
 */
function validateJsonStructure(data) {
  const errors = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Invalid JSON structure: Root must be an object');
    return { success: false, errors };
  }

  // Check for required top-level properties
  if (!data.students && !data.professors) {
    errors.push('JSON must contain either "students" or "professors" array');
    return { success: false, errors };
  }

  // Validate students array if present
  if (data.students) {
    if (!Array.isArray(data.students)) {
      errors.push('Students must be an array');
    } else {
      data.students.forEach((student, index) => {
        const studentErrors = validateStudentData(student, index);
        errors.push(...studentErrors);
      });
    }
  }

  // Validate professors array if present
  if (data.professors) {
    if (!Array.isArray(data.professors)) {
      errors.push('Professors must be an array');
    } else {
      data.professors.forEach((professor, index) => {
        const professorErrors = validateProfessorData(professor, index);
        errors.push(...professorErrors);
      });
    }
  }

  return { success: errors.length === 0, errors };
}

/**
 * Validates individual student data
 * @param {Object} student - Student data object
 * @param {number} index - Index in the array for error reporting
 * @returns {Array} - Array of validation errors
 */
function validateStudentData(student, index) {
  const errors = [];
  const prefix = `Student ${index + 1}`;

  // Check if student is an object
  if (!student || typeof student !== 'object') {
    errors.push(`${prefix}: Must be an object`);
    return errors;
  }

  // Required fields
  const requiredFields = ['name', 'surname', 'student_number', 'email', 'username'];
  requiredFields.forEach(field => {
    if (!student[field] || typeof student[field] !== 'string' || student[field].trim() === '') {
      errors.push(`${prefix}: Missing or invalid ${field}`);
    }
  });

  // Validate name and surname length
  if (student.name && student.name.length > 50) {
    errors.push(`${prefix}: Name too long (max 50 characters)`);
  }
  if (student.surname && student.surname.length > 50) {
    errors.push(`${prefix}: Surname too long (max 50 characters)`);
  }

  // Validate email format and length
  if (student.email) {
    if (student.email.length > 30) {
      errors.push(`${prefix}: Email too long (max 30 characters)`);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
      errors.push(`${prefix}: Invalid email format`);
    }
  }

  // Validate student number (should be numeric and reasonable length)
  if (student.student_number) {
    const studentNum = student.student_number.toString();
    if (!/^\d+$/.test(studentNum)) {
      errors.push(`${prefix}: Student number must be numeric`);
    }
    if (studentNum.length < 7 || studentNum.length > 10) {
      errors.push(`${prefix}: Student number should be 7-10 digits`);
    }
  }

  // Validate username
  if (student.username) {
    if (student.username.length > 255) {
      errors.push(`${prefix}: Username too long (max 255 characters)`);
    }
    if (!/^[a-zA-Z0-9_]+$/.test(student.username)) {
      errors.push(`${prefix}: Username can only contain letters, numbers, and underscores`);
    }
  }

  // Password validation (optional - will use default if not provided)
  if (student.password && typeof student.password !== 'string') {
    errors.push(`${prefix}: Password must be a string if provided`);
  }

  // Validate optional string fields length
  const stringFields = ['street', 'city', 'father_name'];
  stringFields.forEach(field => {
    if (student[field] && typeof student[field] === 'string' && student[field].length > 50) {
      errors.push(`${prefix}: ${field} too long (max 50 characters)`);
    }
  });

  // Validate phone numbers if provided
  if (student.landline_telephone && student.landline_telephone !== '-') {
    if (!/^\+?[\d\s\-()]+$/.test(student.landline_telephone)) {
      errors.push(`${prefix}: Invalid landline telephone format`);
    }
    if (student.landline_telephone.replace(/\D/g, '').length > 15) {
      errors.push(`${prefix}: Landline telephone too long`);
    }
  }

  if (student.mobile_telephone && student.mobile_telephone !== '-') {
    if (!/^\+?[\d\s\-()]+$/.test(student.mobile_telephone)) {
      errors.push(`${prefix}: Invalid mobile telephone format`);
    }
    if (student.mobile_telephone.replace(/\D/g, '').length > 15) {
      errors.push(`${prefix}: Mobile telephone too long`);
    }
  }

  // Validate postcode if provided
  if (student.postcode) {
    const postcodeStr = student.postcode.toString();
    if (!/^\d+$/.test(postcodeStr)) {
      errors.push(`${prefix}: Postcode must be numeric`);
    }
    if (postcodeStr.length > 10) {
      errors.push(`${prefix}: Postcode too long (max 10 digits)`);
    }
  }

  // Validate street number if provided
  if (student.number && !/^\d+[A-Za-z]?$/.test(student.number.toString())) {
    errors.push(`${prefix}: Invalid street number format`);
  }

  return errors;
}

/**
 * Validates individual professor data
 * @param {Object} professor - Professor data object
 * @param {number} index - Index in the array for error reporting
 * @returns {Array} - Array of validation errors
 */
function validateProfessorData(professor, index) {
  const errors = [];
  const prefix = `Professor ${index + 1}`;

  // Check if professor is an object
  if (!professor || typeof professor !== 'object') {
    errors.push(`${prefix}: Must be an object`);
    return errors;
  }

  // Required fields
  const requiredFields = ['name', 'surname', 'email', 'topic', 'department', 'university', 'username'];
  requiredFields.forEach(field => {
    if (!professor[field] || typeof professor[field] !== 'string' || professor[field].trim() === '') {
      errors.push(`${prefix}: Missing or invalid ${field}`);
    }
  });

  // Validate field lengths
  const fieldLimits = {
    name: 50,
    surname: 50,
    email: 30,
    topic: 255,
    department: 250,
    university: 250,
    username: 255
  };

  Object.entries(fieldLimits).forEach(([field, limit]) => {
    if (professor[field] && professor[field].length > limit) {
      errors.push(`${prefix}: ${field} too long (max ${limit} characters)`);
    }
  });

  // Validate username format
  if (professor.username && !/^[a-zA-Z0-9_]+$/.test(professor.username)) {
    errors.push(`${prefix}: Username can only contain letters, numbers, and underscores`);
  }

  // Password validation (optional - will use default if not provided)
  if (professor.password && typeof professor.password !== 'string') {
    errors.push(`${prefix}: Password must be a string if provided`);
  }

  // Validate email format
  if (professor.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(professor.email)) {
    errors.push(`${prefix}: Invalid email format`);
  }

  // Validate phone numbers if provided
  if (professor.landline && professor.landline !== '-') {
    if (!/^\+?[\d\s\-()]+$/.test(professor.landline)) {
      errors.push(`${prefix}: Invalid landline format`);
    }
    if (professor.landline.replace(/\D/g, '').length > 15) {
      errors.push(`${prefix}: Landline too long`);
    }
  }

  if (professor.mobile && professor.mobile !== '-') {
    if (!/^\+?[\d\s\-()]+$/.test(professor.mobile)) {
      errors.push(`${prefix}: Invalid mobile format`);
    }
    if (professor.mobile.replace(/\D/g, '').length > 15) {
      errors.push(`${prefix}: Mobile too long`);
    }
  }

  return errors;
}

/**
 * Generates a unique username based on name and surname
 * @param {string} name - First name
 * @param {string} surname - Last name
 * @param {Object} conn - Database connection
 * @returns {Promise<string>} - Unique username
 */
async function generateUniqueUsername(name, surname, conn) {
  const baseUsername = (name + surname).toLowerCase().replace(/[^a-z0-9]/g, '');
  let username = baseUsername;
  let counter = 1;

  while (true) {
    const existingUser = await conn.query('SELECT id FROM user WHERE username = ?', [username]);
    if (existingUser.length === 0) {
      return username;
    }
    username = baseUsername + counter;
    counter++;
  }
}

/**
 * Finds the next available ID for a given role
 * @param {string} role - User role ('student' or 'professor')
 * @param {Object} conn - Database connection
 * @returns {Promise<number>} - Next available ID
 */
async function getNextAvailableId(role, conn) {
  let baseId, query;
  
  if (role === 'student') {
    baseId = 10000;
    query = 'SELECT MAX(id) as maxId FROM user WHERE role = "student"';
  } else if (role === 'professor') {
    baseId = 100;
    query = 'SELECT MAX(id) as maxId FROM user WHERE role = "professor"';
  } else {
    throw new Error('Invalid role specified');
  }

  const result = await conn.query(query);
  const maxId = result[0]?.maxId || (baseId - 1);
  return Math.max(maxId + 1, baseId);
}

/**
 * Imports student data into the database
 * @param {Array} students - Array of student objects
 * @param {Object} conn - Database connection
 * @returns {Promise<Object>} - Import result
 */
async function importStudents(students, conn) {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  const defaultPassword = '123';

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    
    try {
      // Check if student already exists (by email, student number, or username)
      const existingUser = await conn.query(
        'SELECT u.id FROM user u LEFT JOIN student s ON u.id = s.id WHERE u.email = ? OR s.student_number = ? OR u.username = ?',
        [student.email, student.student_number, student.username]
      );

      if (existingUser.length > 0) {
        results.errors.push(`Student ${i + 1} (${student.name} ${student.surname}): Already exists (email, student number, or username)`);
        results.failed++;
        continue;
      }

      // Generate unique ID and use provided username
      const userId = await getNextAvailableId('student', conn);
      const username = student.username;

      // Use provided password or default
      const password = student.password || defaultPassword;

      // Clean phone numbers (convert '-' to null)
      const landline = student.landline_telephone === '-' ? null : student.landline_telephone;
      const mobile = student.mobile_telephone === '-' ? null : student.mobile_telephone;

      // Insert into user table
      await conn.query(
        `INSERT INTO user (id, username, password, name, surname, email, landline, mobile, role)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'student')`,
        [userId, username, password, student.name, student.surname, student.email, landline, mobile]
      );

      // Insert into student table
      await conn.query(
        `INSERT INTO student (id, student_number, street, street_number, city, postcode, father_name) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          student.student_number,
          student.street || null,
          student.number || null,
          student.city || null,
          student.postcode || null,
          student.father_name || null
        ]
      );

      results.success++;
    } catch (error) {
      results.errors.push(`Student ${i + 1} (${student.name} ${student.surname}): ${error.message}`);
      results.failed++;
    }
  }

  return results;
}

/**
 * Imports professor data into the database
 * @param {Array} professors - Array of professor objects
 * @param {Object} conn - Database connection
 * @returns {Promise<Object>} - Import result
 */
async function importProfessors(professors, conn) {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  const defaultPassword = '123';

  for (let i = 0; i < professors.length; i++) {
    const professor = professors[i];
    
    try {
      // Check if professor already exists (by email or username)
      const existingUser = await conn.query('SELECT id FROM user WHERE email = ? OR username = ?', [professor.email, professor.username]);

      if (existingUser.length > 0) {
        results.errors.push(`Professor ${i + 1} (${professor.name} ${professor.surname}): Already exists (email or username)`);
        results.failed++;
        continue;
      }

      // Generate unique ID and use provided username
      const userId = await getNextAvailableId('professor', conn);
      const username = professor.username;

      // Use provided password or default
      const password = professor.password || defaultPassword;

      // Clean phone numbers (convert '-' to null)
      const landline = professor.landline === '-' ? null : professor.landline;
      const mobile = professor.mobile === '-' ? null : professor.mobile;

      // Insert into user table
      await conn.query(
        `INSERT INTO user (id, username, password, name, surname, email, landline, mobile, role)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'professor')`,
        [userId, username, password, professor.name, professor.surname, professor.email, landline, mobile]
      );

      // Insert into professor table
      await conn.query(
        `INSERT INTO professor (id, topic, department, university) 
         VALUES (?, ?, ?, ?)`,
        [userId, professor.topic, professor.department, professor.university]
      );

      results.success++;
    } catch (error) {
      results.errors.push(`Professor ${i + 1} (${professor.name} ${professor.surname}): ${error.message}`);
      results.failed++;
    }
  }

  return results;
}

/**
 * Main import function that processes JSON data and imports to database
 * @param {Object} jsonData - Parsed JSON data
 * @returns {Promise<Object>} - Complete import result
 */
async function importJsonData(jsonData) {
  // Validate JSON structure
  const validation = validateJsonStructure(jsonData);
  if (!validation.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    };
  }

  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();

    const importResults = {
      students: { success: 0, failed: 0, errors: [] },
      professors: { success: 0, failed: 0, errors: [] }
    };

    // Import students if present
    if (jsonData.students && jsonData.students.length > 0) {
      importResults.students = await importStudents(jsonData.students, conn);
    }

    // Import professors if present
    if (jsonData.professors && jsonData.professors.length > 0) {
      importResults.professors = await importProfessors(jsonData.professors, conn);
    }

    await conn.commit();

    const totalSuccess = importResults.students.success + importResults.professors.success;
    const totalFailed = importResults.students.failed + importResults.professors.failed;
    const allErrors = [...importResults.students.errors, ...importResults.professors.errors];

    return {
      success: true,
      message: `Import completed: ${totalSuccess} successful, ${totalFailed} failed`,
      results: importResults,
      summary: {
        totalSuccess,
        totalFailed,
        errors: allErrors
      }
    };

  } catch (error) {
    await conn.rollback();
    return {
      success: false,
      message: 'Database error during import',
      error: error.message
    };
  } finally {
    conn.release();
  }
}

/**
 * Checks for duplicate entries within the JSON data
 * @param {Object} data - The parsed JSON data
 * @returns {Array} - Array of duplicate warnings
 */
function checkForDuplicates(data) {
  const warnings = [];

  // Check for duplicate students
  if (data.students && Array.isArray(data.students)) {
    const emails = new Set();
    const studentNumbers = new Set();

    data.students.forEach((student, index) => {
      if (student.email) {
        if (emails.has(student.email)) {
          warnings.push(`Duplicate student email found: ${student.email} (Student ${index + 1})`);
        } else {
          emails.add(student.email);
        }
      }

      if (student.student_number) {
        if (studentNumbers.has(student.student_number)) {
          warnings.push(`Duplicate student number found: ${student.student_number} (Student ${index + 1})`);
        } else {
          studentNumbers.add(student.student_number);
        }
      }
    });
  }

  // Check for duplicate professors
  if (data.professors && Array.isArray(data.professors)) {
    const emails = new Set();

    data.professors.forEach((professor, index) => {
      if (professor.email) {
        if (emails.has(professor.email)) {
          warnings.push(`Duplicate professor email found: ${professor.email} (Professor ${index + 1})`);
        } else {
          emails.add(professor.email);
        }
      }
    });
  }

  return warnings;
}

/**
 * Validates the overall data integrity and provides warnings
 * @param {Object} data - The parsed JSON data
 * @returns {Object} - Validation result with warnings
 */
function validateDataIntegrity(data) {
  const warnings = [];

  // Check for duplicates
  const duplicateWarnings = checkForDuplicates(data);
  warnings.push(...duplicateWarnings);

  // Check data size limits
  if (data.students && data.students.length > 1000) {
    warnings.push(`Large number of students (${data.students.length}). Consider importing in smaller batches.`);
  }

  if (data.professors && data.professors.length > 500) {
    warnings.push(`Large number of professors (${data.professors.length}). Consider importing in smaller batches.`);
  }

  return {
    warnings,
    hasWarnings: warnings.length > 0
  };
}

module.exports = {
  importJsonData,
  validateJsonStructure,
  validateDataIntegrity,
  checkForDuplicates
};

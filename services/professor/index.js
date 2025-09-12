const {
  getUnderAssignment,
  getRelevantThesis,
  searchStudents,
  getAvailableTopics,
  getTemporaryAssignments,
  assignThesisToStudent,
  getAssignmentDate,
  cancelThesisUnderAssignment,
  cancelActiveThesisAssignment
} = require('./assignmentService');

const {
  enableGrading, getGradingStatus, getGrades, saveProfessorGrade
} = require('./gradeService');


const {
  getProfessorInvitations,
  acceptInvitation,
  rejectInvitation,
  leaveComittee,
  getThesisInvitations
} = require('./invitationService');

const {
  addNoteForThesis,
  editNote,
  deleteNote,
  getProfessorNotesForThesis
} = require('./noteService');

const {
  createPresentationAnnouncement,
  getPresentationAnnouncement
} = require('./presentationService');

const { getProfessorRole } = require('./roleService');
const { getInstructorStatistics } = require('./statisticsService');

const {
  insertThesisToDB,
  updateThesis,
  deleteThesis,
  getSpecificThesis,
  markUnderReview,
  getDraftFilename,
  getPresentationDate
} = require('./thesisService');

const { getThesisTimeline } = require('./timelineService');


module.exports = {
  insertThesisToDB,
  getUnderAssignment,
  getRelevantThesis,
  searchStudents,
  getAvailableTopics,
  assignThesisToStudent,
  getTemporaryAssignments,
  cancelActiveThesisAssignment,
  cancelThesisUnderAssignment,
  updateThesis,
  getProfessorInvitations,
  acceptInvitation,
  rejectInvitation,
  leaveComittee,
  getThesisTimeline,
  deleteThesis,
  getInstructorStatistics,
  getSpecificThesis,
  getThesisInvitations,
  getProfessorNotesForThesis,
  addNoteForThesis,
  editNote,
  deleteNote,
  getProfessorRole,
  getAssignmentDate,
  markUnderReview,
  getDraftFilename,
  getPresentationDate,
  createPresentationAnnouncement,
  getPresentationAnnouncement,
  enableGrading,
  getGradingStatus,
  getGrades,
  saveProfessorGrade
};
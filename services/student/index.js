const {
  getCommitteeStatus,
  searchProfessors,
  inviteProfessor,
  cancelPendingInvitations
} = require('./committeeService');

const { getStudentInformation, updateStudentInformation } = require('./profileService');

const {
  saveFileNameToDB,
  getThesisInfo,
  getDetailedThesisInfo,
  addMaterialLink,
  saveExamDetails,
  saveRepositoryLink
} = require('./thesisService');


module.exports = {
  saveFileNameToDB,
  getStudentInformation,
  updateStudentInformation,
  getThesisInfo,
  getDetailedThesisInfo,
  getCommitteeStatus,
  searchProfessors,
  inviteProfessor,
  addMaterialLink,
  saveExamDetails,
  saveRepositoryLink,
  cancelPendingInvitations
};
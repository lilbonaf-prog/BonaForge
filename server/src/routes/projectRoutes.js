const express = require(
  "express"
);

const {
  getProjects,
  getProjectById,
  getProjectByLead,
  createProject,
  updateProject,
  startProject,
  holdProject,
  completeProject,
  cancelProject,
  reopenProject,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  deleteProject,
} = require(
  "../controllers/projectController"
);

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

const router =
  express.Router();

// ==============================
// AUTH
// ==============================

router.use(protect);

// ==============================
// PROJECT LIST
// ==============================

router.get(
  "/",
  getProjects
);

// ==============================
// LEAD → PROJECT
// ==============================

router.get(
  "/lead/:leadId",
  getProjectByLead
);

router.post(
  "/lead/:leadId",
  createProject
);

// ==============================
// PROJECT WORKFLOW
// ==============================

router.post(
  "/:projectId/start",
  startProject
);

router.post(
  "/:projectId/hold",
  holdProject
);

router.post(
  "/:projectId/complete",
  completeProject
);

router.post(
  "/:projectId/cancel",
  cancelProject
);

router.post(
  "/:projectId/reopen",
  reopenProject
);

// ==============================
// MILESTONES
// ==============================

router.post(
  "/:projectId/milestones",
  addMilestone
);

router.patch(
  "/:projectId/milestones/:milestoneId",
  updateMilestone
);

router.delete(
  "/:projectId/milestones/:milestoneId",
  deleteMilestone
);

// ==============================
// PROJECT CRUD
// ==============================

router.get(
  "/:projectId",
  getProjectById
);

router.patch(
  "/:projectId",
  updateProject
);

router.delete(
  "/:projectId",
  deleteProject
);

module.exports = router;
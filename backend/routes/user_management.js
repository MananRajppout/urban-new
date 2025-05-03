const express = require("express");
const checkSessionExpiration = require("../middleware/auth");
const {
  getAllUsers,
  editUser,
  inviteOrgUser,
  getRole,
} = require("../user_management/controller");
const rolePermit = require("../middleware/role_auth");

const router = express.Router();

// METHOD : GET
router
  .route("/get-org-users")
  .get(checkSessionExpiration(["customer"]), getAllUsers);
router.route("/role").get(checkSessionExpiration(["customer"]), getRole);

// METHOD : POST
router
  .route("/edit-org-user")
  .post(
    checkSessionExpiration(["customer"]),
    rolePermit({ permit_access: "user:edit" }),
    editUser
  );
router
  .route("/invite-org-user")
  .post(
    checkSessionExpiration(["customer"]),
    rolePermit({ permit_access: "user:invite" }),
    inviteOrgUser
  );

module.exports = router;

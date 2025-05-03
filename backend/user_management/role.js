// roles.js

// Define roles with IDs
const roles = {
    1: 'admin',
    2: 'subAdmin',
    3: 'manager',
    4: 'supportUser'
};

// Export role names
const getRoleName = (roleId) => roles[roleId] || 'Unknown Role';

module.exports = {
    roles,
    getRoleName
};
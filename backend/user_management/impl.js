/**
 * Retrieves the fields that can be edited in the user model.
 * These fields are considered editable by the user management system.
 * 
 * @returns {Array} List of editable fields for the user model.
 */
const editableUserModelFields = () => {
    return ['is_active', 'role_id', 'email', 'full_name', 'phone_number', 'country_code'];
};

module.exports = { editableUserModelFields };

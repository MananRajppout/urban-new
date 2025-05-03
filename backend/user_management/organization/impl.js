/**
 * Retrieves an organization by its `org_id`.
 * If the organization doesn't exist, it creates a new one.
 *
 * @param {String} org_id - The ID of the organization to fetch or create.
 * @returns {Promise<Object>} - A promise that resolves to the organization object.
 */
async function getOrganization(org_id) {
    let org = await Organization.findOne({ org_id: org_id });

    if (org) {
        return org;
    }

    org = await Organization.create({ org_id: org_id });
    // Return the newly created organization
    return org;
}

module.exports = { getOrganization };

const mongoose = require('mongoose');

// Define the organization schema
const organizationSchema = new mongoose.Schema(
    {
        org_id: { type: String, unique: true, required: true }, // Unique identifier for the organization
        name: { type: String, required: false }, // Organization name, required
        website: {
            type: String,
            validate: {
                validator: function (v) {
                    return /^https?:\/\/.+\..+/.test(v); // Basic URL validation
                },
                message: props => `${props.value} is not a valid URL!`,
            },
            required: false, // Website is optional
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Create and export the model
module.exports = {
    Organization: mongoose.model('Organization', organizationSchema)
}

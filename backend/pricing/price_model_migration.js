const { PricePlan } = require("../pricing/model"); // Import the PricePlan model

async function createPricePlans() {
  try {
    // Create 6 PricePlan entries

    // Start months entry
    const pricePlans = [
        {
            name: "free",
            period: "month",
            cost: 0,
            allowed_characters: 10000,
            support_team: true,
            document_upload: true,
            number_of_chatbots:1
        },
      {
        name: "hobby",
        period: "month",
        cost: 9.99,
        allowed_characters: 10000,
        support_team: true,
        document_upload: true,
        number_of_chatbots:2
      },
      {
        name: "standard",
        period: "month",
        cost: 15.99,
        allowed_characters: 25000,
        support_team: true,
        document_upload: true,
        number_of_chatbots:5
      },
      {
        name: "unlimited",
        period: "month",
        cost: 55.99,
        allowed_characters: 55000,
        support_team: true,
        document_upload: true,
        number_of_chatbots:10
      },


      // Start yearly
      {
        name: "hobby",
        period: "year",
        cost: 118,
        allowed_characters: 10000,
        support_team: true,
        document_upload: true,
        number_of_chatbots:2
      },
      {
        name: "standard",
        period: "year",
        cost: 191,
        allowed_characters: 25000,
        support_team: true,
        document_upload: true,
        number_of_chatbots:5
      },
      {
        name: "unlimited",
        period: "year",
        cost: 671.88,
        allowed_characters: 55000,
        support_team: true,
        document_upload: true,
        number_of_chatbots:10
      },
    ];

    // Insert the price plans into the database
    const insertedPricePlans = await PricePlan.insertMany(pricePlans);

    console.log("PricePlans created:", insertedPricePlans);
  } catch (error) {
    console.error("Error creating PricePlans:", error);
  } finally {
    // Close the database connection
   console.log("Migration done the objects are added")
  }
}

// Call the function to create PricePlans

module.exports = {
  createPricePlans
};

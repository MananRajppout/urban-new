const express = require('express');
const router = express.Router();
const passport = require('passport');
const { User } = require('../user/model'); // Import User model
const { sendMailFun } = require('../utils/infra'); // Import sendMail function

// This route will handle the webhook events from AppSumo
router.post('/webhook', (req, res) => {
  const event = req.body;

  console.log('Webhook event received:', event);

  if (event.test) {
    // Pre-validation response for test
    return res.status(200).json({
      event: event.event_type || 'test',
      success: true
    });
  }

  switch (event.event_type) {
    case 'purchase':
      handlePurchaseEvent(event);
      break;
    case 'activate':
      handleActivateEvent(event);
      break;
    // case 'upgrade':
    //   handleUpgradeEvent(event);
    //   break;
    // case 'downgrade':
    //   handleDowngradeEvent(event);
      break;
    case 'deactivate':
      handleDeactivateEvent(event);
      break;
    default:
      console.log('Unknown event type:', event.event_type);
  }

  res.status(200).json({
    event: event.event_type,
    success: true
  });
});

const handlePurchaseEvent = async (event) => {
  try {
    const email = event.payload.email;
    const productName = event.payload.product_name;
    const purchaseDate = event.payload.purchase_date;

    // Check if the user already exists in the database
    let user = await User.findOne({ email });

    if (!user) {
      // If the user doesn't exist, create a new user record
      user = new User({ email, products: [{ name: productName, purchaseDate }] });
      await user.save();
    } else {
      // If the user exists, update their record with the new purchase
      user.products.push({ name: productName, purchaseDate });
      await user.save();
    }

    // Send a confirmation email to the user
    const ctx = { email, productName, purchaseDate };
    await sendMailFun('purchase_confirmation', ctx, email);

    console.log('Purchase event handled successfully for user:', email);
  } catch (error) {
    console.error('Error handling purchase event:', error);
  }
};

const handleActivateEvent = async (event) => {
    try {
      const email = event.payload.email;
      const activationDate = event.payload.activation_date;
  
      // Find the user in the database
      let user = await User.findOne({ email });
  
      if (user) {
        // Update the user's activation status and date
        user.isActive = true;
        user.activationDate = activationDate;
      } else {
        // If the user doesn't exist, create a new user record with the activated product
        user = new User({
          email,
          isActive: true,
          activationDate
        });
      }
  
      await user.save();
  
      // Send a confirmation email to the user
      const ctx = { email, activationDate };
      await sendMailFun('activation_confirmation', ctx, email);
  
      console.log('Activate event handled successfully for user:', email);
    } catch (error) {
      console.error('Error handling activate event:', error);
    }
  };
  

// const handleUpgradeEvent = async (event) => {
//   try {
//     const email = event.payload.email;

//     // Your logic for handling the upgrade event
//     console.log('Upgrade event handled for user:', email);
//   } catch (error) {
//     console.error('Error handling upgrade event:', error);
//   }
// };
// const handleDowngradeEvent = async (event) => {
//   try {
//     const email = event.payload.email;
//     // Your logic for handling the downgrade event
//     console.log('Downgrade event handled for user:', email);
//   } catch (error) {
//     console.error('Error handling downgrade event:', error);
//   }
// };

const handleDeactivateEvent = async (event) => {
    try {
      const email = event.payload.email;
      const deactivationDate = event.payload.deactivation_date;
  
      // Find the user in the database
      let user = await User.findOne({ email });
  
      if (user) {
        // Update the user's activation status and date
        user.isActive = false;
        user.deactivationDate = deactivationDate;
        await user.save();
  
        // Send a confirmation email to the user
        const ctx = { email, deactivationDate };
        await sendMailFun('deactivation_confirmation', ctx, email);
  
        console.log('Deactivate event handled successfully for user:', email);
      } else {
        console.log('User not found:', email);
      }
    } catch (error) {
      console.error('Error handling deactivate event:', error);
    }
  };
  

// Initiate OAuth authentication
router.get('/provider', passport.authenticate('oauth2'));

// Handle OAuth callback
router.get('/provider/callback', 
  passport.authenticate('oauth2', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/'); //
  }
);

// Validation endpoint for AppSumo
router.get('/provider/validate', (req, res) => {
  res.sendStatus(200);
});

module.exports = router;
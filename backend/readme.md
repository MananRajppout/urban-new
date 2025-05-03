[Urbanchat]

/*
1. We already has PricingPlan in our database, at runtime getPricingPlan will be called and fetch the plan .
2. So once the a/c has been created at the same time fetch default plan and set the message_limit to the user.message_limit  
3. Create a table in DyanmoDB 
    Restriction {
        user_id:
        consumed_messages_user:
        quota_messages_user:
        price_plan_id:
    }
4. Whenever we are sending a message and we have the chatbotModel object lets call the Restriction data filter and get the quota per messages

domains-> 5
*/

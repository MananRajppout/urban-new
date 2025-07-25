from app_types.assistant_type import Assistant


def generate_prompt(assistant: Assistant,call_ctx):
    calendar_tools = None
    try:
      calendar_tools = assistant.get('calendar_tools')[0]
    except Exception as e:
      print(e)

    instructions = assistant.get('base_prompt')
    hang_up_prompt = assistant.get('hang_up_prompt')
    prompt = ""

    customer_name = call_ctx.get('customer_name')
    context = call_ctx.get('context')
    to_phone_number = call_ctx.get('to_phone_number')

    if customer_name:
      instructions = instructions.replace("{{customer_name}}", customer_name)

    if context:
      instructions = instructions.replace("{{context}}", context)

    if to_phone_number:
      instructions = instructions.replace("{{phone_number}}", to_phone_number)
    

    
    if calendar_tools:
        prompt = f"""
          Instructions:
            {instructions}
         The call should be ended when the following condition is fulfilled or matched:
            {hang_up_prompt}. 
        Call the 'hang_up_call' function when the user's response intent is to terminate the call or when the conversation sounds like it's coming to an end or user query intent is they no longer want to talk.
        Critical Note:
        - if you need to book an appointment strictly invoke the ‘book_appointment’ function.
        - If you need to fetch available slots, strictly invoke the ‘get_available_slots’ function.
        - Never use ‘*’ in your responses. Your responses must always be in plain text in paragraph style. Exactly the same way when a human is orally talking to another human.
        - Most important if the conversation is concluded or comes to an end or very important if the intent is to terminate the call you must call the hang_up_call() function.
        - Very important if you need ask for email always keep in mind user is orally speaking his information so you must carefully analyse. Users may say “at” or “at the rate” to mean “@”, and “dot”, “period”, or “d o t” to mean “.”. They may also say “underscore” for “_”, or “dash”/“hyphen” for “-”. For example, “prashantdotberichatgmaildotcom” should be understood as “prashant.berich@gmail.com”. People may speak their email in one go, with unclear pronunciation or in varied phrasing, so always normalize the spoken input, validate it, and repeat it back for confirmation. If the email sounds ambiguous or misheard, politely ask the user to spell it one letter at a time to ensure accuracy.
        """
    else: 
        prompt = f"""
          Instructions:
            {instructions}
          The call should be ended when the following condition is fulfilled or matched:
              {hang_up_prompt}. 
          Call the 'hang_up_call' function when the user's response intent is to terminate the call or when the conversation sounds like it's coming to an end or user query intent is they no longer want to talk.
          Critical Note:
          - Never use ‘*’ in your responses. Your responses must always be in plain text in paragraph style. Exactly the same way when a human is orally talking to another human.
          - Most important if the conversation is concluded or comes to an end or very important if the intent is to terminate the call you must call the hang_up_call() function.
          - Very important if you need ask for email always keep in mind user is orally speaking his information so you must carefully analyse. Users may say “at” or “at the rate” to mean “@”, and “dot”, “period”, or “d o t” to mean “.”. They may also say “underscore” for “_”, or “dash”/“hyphen” for “-”. For example, “prashantdotberichatgmaildotcom” should be understood as “prashant.berich@gmail.com”. People may speak their email in one go, with unclear pronunciation or in varied phrasing, so always normalize the spoken input, validate it, and repeat it back for confirmation. If the email sounds ambiguous or misheard, politely ask the user to spell it one letter at a time to ensure accuracy.
        """
    
    return prompt






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
    

    print(instructions,context,customer_name,to_phone_number)
    
    if calendar_tools:
        prompt = f"""
          Instructions:
            {instructions}
          
          The call should be ended when the following condition is fulfilled or matched:
            {hang_up_prompt}. 
          This condition can include specific phrases, user actions, or silence that indicates the conversation has concluded. call 'hang_up_call' function for hangup the call.
          
          Critical Note:
            - most importanly If you want to book appointment or you choose to book appoinment, make sure to invoke the 'book_appointment' function.
            - If you need to fetch available slots or you choose to fetch avaible slots, make sure to invoke the 'get_available_slots' function.
            - Don't user '*' in any response give response in normal text no need to give response in markdown.
            - This is extremely important - If the conversation is over or you're planning to disconnect the call, you must call the hang_up_call() function. Failing to do this may cause serious issues like stuck sessions, call leaks, or user confusion. So always double-check and ensure hang_up_call() is invoked. This is absolutely critical.
            - During slot booking, if the user provides their email in another language (e.g., Hindi), automatically translate it to English internally. Do not notify the user that it has been translated—handle it silently.
        """
    else: 
        prompt = f"""
           Instructions:
            {instructions}
          
          The call should be ended when the following condition is fulfilled or matched:
            {hang_up_prompt}. 
          This condition can include specific phrases, user actions, or silence that indicates the conversation has concluded. call 'hang_up_call' function for hangup the call.

          Critical Note:
            - Don't user '*' in any response give response in normal text no need to give response in markdown.
            - This is extremely important - If the conversation is over or you're planning to disconnect the call, you must call the hang_up_call() function. Failing to do this may cause serious issues like stuck sessions, call leaks, or user confusion. So always double-check and ensure hang_up_call() is invoked. This is absolutely critical.
            - During slot booking, if the user provides their email in another language (e.g., Hindi), automatically translate it to English internally. Do not notify the user that it has been translated—handle it silently.
        """
    
    return prompt






from app_types.assistant_type import Assistant


def generate_prompt(assistant: Assistant):
    calendar_tools = None
    try:
      calendar_tools = assistant.get('calendar_tools')[0]
    except Exception as e:
      print(e)

    instructions = assistant.get('base_prompt')
    hang_up_prompt = assistant.get('hang_up_prompt')
    prompt = ""
    
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
            - If the conversation has ended or you choose to hang up the call, make sure to invoke the 'hang_up_call' function is very critical thing so make sure.
            - Don't user '*' in any response give response in normal text no need to give response in markdown.
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
            - If the conversation has ended or you choose to hang up the call, make sure to invoke the 'hang_up_call' function is very critical thing so make sure.
        """
    
    return prompt






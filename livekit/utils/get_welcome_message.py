from app_types.assistant_type import Assistant


def get_welcome_message(assistant: Assistant,call_ctx):
    

    welcome_message_text = assistant.get('welcome_message_text')

   
    customer_name = call_ctx.get('customer_name')
    context = call_ctx.get('context')
    to_phone_number = call_ctx.get('to_phone_number')

    if customer_name:
      welcome_message_text = welcome_message_text.replace("{{customer_name}}", customer_name)

    if context:
      welcome_message_text = welcome_message_text.replace("{{context}}", context)

    if to_phone_number:
      welcome_message_text = welcome_message_text.replace("{{phone_number}}", to_phone_number)
    

    
    return welcome_message_text






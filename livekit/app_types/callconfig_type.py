from typing import TypedDict, Literal, Optional

class CallContext(TypedDict, total=False):
    agentId: str
    callType: Literal["web", "telephone"]
    callId: str
    dir: str 
    customer_name: Optional[str] 
    context: Optional[str]        
    phone_number: Optional[str]   
    to_phone_number: Optional[str]   

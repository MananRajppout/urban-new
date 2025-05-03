
Clean Version of User management Design

Role :->   - done
{
    default:1
    2: subAdmin,
    3.Manager,
    4. supportUser

}

getChatbotAccessByRoleID(){
    return 1: [
        'chatbot:write',
        'chatbot:read',
        'chatbot:export',
        'user:invite'
    ]

    return 2:{
        return 1: [
            'chatbot:write',
            'chatbot:read',
            'chatbot:export',
            'user:invite'
        ]
    }
}


API: { - done
    -> 'chatbot':'write'
    -> 

    Fn(required_role_access) : InMiddleware-> check 
        user => populate
        accessList = getChatbotAccessByRoleID(user.role_id)
        if required_role_access not in accessList:
            throw Error()
}


Organization
===

-> getOrganization(
    org_id: admin_user_id 
    name: ''
    website: ''
)

-> UpdateSaveOrg(data)
    org = getOrganization()
    org.updateFields()
    org.save()


In Middleware    - done
====
1. if not user.org_id and user.role_id == 1:
    user.org_id = user.id 


InviteUser
====
=> /invite/org_user/
    {
        user_email: '',
        user_name: ''
        role_id : except : admin 
    }

    In API controller set { payload:org_id } 

=> 





    





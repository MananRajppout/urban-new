import AxiosInstance from "../axios";


const header = {
  headers: {
    "Content-Type": "application/json",
  },
};

// Invite Org User API
export async function inviteOrganizationUser(data) {
    return await AxiosInstance.post("/api/invite-org-user", data,header);
}


export async function fetchInviteOrgUser() {
  const response = await AxiosInstance.get("/api/get-org-users",header)
  return response.data.users;
}


export async function editInviteUser(userdata) {
  const response = await AxiosInstance.post("/api/edit-org-user",userdata,header);
  return response.data;
}




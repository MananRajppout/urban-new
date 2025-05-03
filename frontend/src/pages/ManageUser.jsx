import React, { useEffect, useState } from "react";
import {
  inviteOrganizationUser,
  fetchInviteOrgUser,
  editInviteUser,
} from "../lib/api/ApiInviteUser.js";
import toast from "react-hot-toast";
import "@/styles/ManageUser.css";
import { FaTrash, FaEdit } from "react-icons/fa";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [filterAccess, setFilterAccess] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    country_code: "",
    role_id: 4,
  });

  const filteredUsers = filterAccess
    ? users.filter((user) => user.role_id === parseInt(filterAccess))
    : users;

  const handleDropdownToggle = (id) => {
    setIsDropdownVisible(isDropdownVisible === id ? null : id);
  };

  const openEditModal = (user) => {
    console.log("this is the user data after click to edit", user);
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updateData = {
      user_id: editingUser._id,
      role_id: editingUser.role_id,
      full_name: editingUser.full_name,
      phone_number: editingUser.phone_number,
      email: editingUser.email,
      country_code: editingUser.country_code,
      is_active: true,
    };

    try {
      const response = await editInviteUser(updateData);
      if (response.success) {
        const updatedUsers = users.map((user) =>
          user._id === editingUser._id ? { ...editingUser } : user
        );
        setUsers(updatedUsers);
        toast.success("User updated successfully!");
      } else {
        toast.error(response.message || "Failed to update user.");
      }
    } catch (error) {
      console.error("Error while updating user:", error);
      toast.error(error.response?.data?.message || "An error occurred.");
    }
    closeEditModal();
    handleDropdownToggle(updateData);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await inviteOrganizationUser(newUser);
      if (response.code === 200) {
        const newUserId = users.length + 1;
        setUsers([
          ...users,
          {
            ...newUser,
            _id: newUserId,
            created_time: new Date().toLocaleDateString(),
          },
        ]);
        setIsInviteModalOpen(false);
        setNewUser({
          full_name: "",
          email: "",
          phone_number: "",
          country_code: "",
          role_id: 4,
        });
      } else {
        console.error("Error inviting user:", response);
      }
    } catch (error) {
      console.error("Error while inviting user:", error);
    }
  };

  useEffect(() => {
    const getInviteUsers = async () => {
      const response = await fetchInviteOrgUser();
      const formattedUsers = response.map((user) => ({
        ...user,
        created_time: new Date(user.created_time).toLocaleDateString(),
      }));
      setUsers(formattedUsers);
    };
    getInviteUsers();
  }, []);

  return (
    <div className="main-container flex flex-col h-screen">
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-6 px-8 rounded-3xl shadow-lg flex justify-between items-center">
        <h1 className="text-xl font-semibold tracking-wide md:text-2xl">
          User Management
        </h1>
        <div className="hidden lg:block">
          <p className="text-xs font-light text-white/80">
            Manage and organize your users effectively
          </p>
        </div>
      </header>

      <div className="content flex-1 p-6">
        <div className="top-section flex flex-col md:flex-row justify-between items-center mb-5 px-6 md:px-10 space-y-8 md:space-y-0">
          <div className="text-center md:text-left mb-8 md:mb-0 max-w-lg">
            <h2 className="text-xl font-bold text-white tracking-tight mb-4 leading-tight transition-all duration-300 ease-in-out hover:text-gray-300  ">
              Manage Users
            </h2>
            <p className="text-sm  text-gray-300 leading-relaxed opacity-90 hover:opacity-100 transition-all duration-300 ease-in-out hover:text-gray-200">
              Seamlessly control user roles, permissions, and data access with
              an intuitive interface and real-time updates.
            </p>
          </div>

          <div className="mt-8 md:mt-0 flex justify-center md:justify-start">
            <button
              className="px-4 py-3 text-white bg-gradient-to-r from-cyan-500 to-teal-500 rounded-3xl shadow-lg hover:bg-teal-700 hover:scale-105 transform transition-all duration-400 ease-in-out focus:outline-none focus:ring-4 focus:ring-teal-400 focus:ring-opacity-50"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <span className="font-semibold text-sm group-hover:text-white transition-all duration-300 ease-in-out">
                Invite New User
              </span>
            </button>
          </div>
        </div>
        <div className="filter-section flex flex-col md:flex-row justify-between items-center gap-6 mb-6 p-6 border border-gray-600 rounded-lg shadow-lg bg-gradient-to-r  transition-transform duration-300 hover:shadow-2xl ">
          {/* Filter Section */}
          <div className="flex items-center space-x-4">
            <label
              htmlFor="filter"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300"
            >
              Filter by Role:
            </label>
            <select
              id="filter"
              value={filterAccess}
              onChange={(e) => setFilterAccess(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-sm rounded-md py-2 px-4 text-gray-300 placeholder-gray-500 hover:text-white hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 shadow-md transition-all duration-300"
            >
              <option value="" className="bg-gray-700">
                All
              </option>
              <option value="1" className="bg-gray-700">
                Admin
              </option>
              <option value="2" className="bg-gray-700">
                Sub-Admin
              </option>
              <option value="3" className="bg-gray-700">
                Editor
              </option>
              <option value="4" className="bg-gray-700">
                Viewer
              </option>
            </select>
          </div>

          {/* User Info Section */}
          <div className="flex items-center text-gray-300 gap-3 text-sm font-medium hover:text-white transition-all duration-300">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-cyan-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 3a9 9 0 100 18 9 9 0 000-18zm-1.125 9.9a.75.75 0 00-.75-.75H9.75a.75.75 0 000 1.5h.375c.207 0 .375-.168.375-.375zm.75 2.25a1.125 1.125 0 111.125-1.125 1.126 1.126 0 01-1.125 1.125z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Total Users:</span>
            </div>
            <span className="font-bold text-lg text-white">{users.length}</span>
          </div>
        </div>

        <div className="users-list bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl rounded-3xl overflow-hidden max-h-[700px] border border-gray-700">
          {/* Header */}
          <div className="header bg-gradient-to-r from-[#2a2f37] via-[#343c43] to-[#2a2f37] text-white px-4 md:px-6 py-4 md:py-5 grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 sticky top-0 z-20 backdrop-blur-lg shadow-lg rounded-t-3xl text-center">
            <p className="font-bold uppercase tracking-wider text-xs md:text-sm lg:text-md">
              <span className="text-lg md:text-xl">&#128100;</span>
              <span className="block mt-1">Name</span>
            </p>
            <p className="font-bold uppercase tracking-wider text-xs md:text-sm lg:text-md">
              <span className="text-lg md:text-xl">&#128221;</span>
              <span className="block mt-1">Role</span>
            </p>
            <p className="font-bold uppercase tracking-wider text-xs md:text-sm lg:text-md">
              <span className="text-lg md:text-xl">&#128197;</span>
              <span className="block mt-1">Date Added</span>
            </p>
            <p className="hidden md:block font-bold uppercase tracking-wider text-xs md:text-sm lg:text-md">
              <span className="text-lg md:text-xl">&#9881;</span>
              <span className="block mt-1">Actions</span>
            </p>
          </div>

          {/* Users List */}
          <div className="overflow-y-auto max-h-[600px] pr-3 custom-scrollbar scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            {filteredUsers.length ? (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="user-row grid grid-cols-[2fr_1fr_1fr_1fr] md:grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-center bg-gradient-to-b from-gray-800 to-gray-900 px-4 md:px-6 py-4 md:py-5 rounded-xl mb-3 md:mb-4 shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl hover:bg-gradient-to-b from-gray-900 to-gray-700 text-center"
                >
                  {/* Name & Email */}
                  <div>
                    <p className="font-medium text-white text-sm md:text-base truncate">
                      {user.full_name}
                    </p>
                    <p className="text-xs md:text-sm text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Role Badge */}
                  <div>
                    <span
                      className="badge text-xs md:text-sm font-semibold text-white py-1 px-4 md:py-2 md:px-5 rounded-full shadow-md capitalize transition-transform duration-300 hover:scale-105"
                      style={{
                        background:
                          user.role_id === 1
                            ? "linear-gradient(to right, #03a49b, #02e2be)"
                            : user.role_id === 2
                            ? "linear-gradient(to right, #e67e22, #f39c12)"
                            : user.role_id === 3
                            ? "linear-gradient(to right, #2980b9, #3498db)"
                            : "linear-gradient(to right, #7f8c8d, #95a5a6)",
                      }}
                    >
                      {user.role_id === 1
                        ? "Admin"
                        : user.role_id === 2
                        ? "Sub-Admin"
                        : user.role_id === 3
                        ? "Editor"
                        : "Viewer"}
                    </span>
                  </div>

                  {/* Date Added */}
                  <div>
                    <p className="text-xs md:text-sm text-gray-400 truncate">
                      {user.created_time}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="hidden md:flex items-center justify-center space-x-2 lg:space-x-3">
                    <button
                      aria-label={`Edit ${user.full_name}`}
                      className="p-2 md:p-3 rounded-full bg-[#344d56] text-white hover:bg-[#456671] transition-transform duration-300 hover:scale-105 shadow-lg focus:outline-none"
                      onClick={() => openEditModal(user)}
                    >
                      <FaEdit className="text-sm md:text-md"/>
                    </button>
                    <button
                      aria-label={`Delete ${user.full_name}`}
                      className="p-2 md:p-3 rounded-full bg-[#e74c3c] text-white hover:bg-[#c0392b] transition-transform duration-300 hover:scale-105 shadow-lg focus:outline-none"
                      onClick={() => console.log("Delete user", user._id)}
                    >
                      <FaTrash className="text-sm md:text-md" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-16">
                <p className="text-gray-500 text-sm md:text-base font-semibold">
                  No users found. Add some to get started!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingUser && (
        <div
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 backdrop-blur-sm p-4 sm:p-8 z-50"
          role="dialog"
          aria-labelledby="edit-user-modal-title"
          aria-modal="true"
        >
          {/* Modal Container */}
          <div className="relative bg-white dark:bg-gray-900 bg-opacity-90 shadow-xl rounded-xl p-6 sm:p-10 w-full max-w-md transform scale-100 animate-fade-in">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close Modal"
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="mb-6 text-center">
              <h2
                id="edit-user-modal-title"
                className="text-2xl font-extrabold text-gray-800 dark:text-gray-200 tracking-wide"
              >
                Update Role
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Customize user permissions seamlessly.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label htmlFor="editUserName" className="block text-sm text-gray-700 dark:text-gray-400 font-semibold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="editUserName"
                  value={editingUser.full_name}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      full_name: e.target.value,
                    })
                  }
                  className="block w-full px-4 py-2 rounded-md shadow-sm border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              {/* Role Selection */}
              <div className="mb-4">
              <label htmlFor="editUserEmail" className="block text-sm text-gray-700 dark:text-gray-400 font-semibold mb-2">Email:</label>
              <input type="email" id="editUserEmail"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                className="block w-full px-4 py-2 rounded-md shadow-sm border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="editUserNumber" className="block text-sm text-gray-700 dark:text-gray-400 font-semibold mb-2">Phone Number</label>
              <input type="Number" id="editUserNumber"
                value={editingUser.phone_number}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, phone_number: e.target.value })
                }
                  className="block w-full px-4 py-2 rounded-md shadow-sm border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="editUserCountryCode" className="block text-sm text-gray-700 dark:text-gray-400 font-semibold mb-2">CountryCode:</label>
              <input type="text" id="editUserCountryCode"
                value={editingUser.country_code}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, country_code: e.target.value })
                }
                  className="block w-full px-4 py-2 rounded-md shadow-sm border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="role" className="block text-sm text-gray-700 dark:text-gray-400 font-semibold mb-2">Role:</label>
              <select
                id="role"
                value={editingUser.role_id}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, role_id: parseInt(e.target.value) })
                }
                className="block w-full px-4 py-2 rounded-md shadow-sm border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value={1}>Admin</option>
                <option value={2}>Sub-Admin</option>
                <option value={3}>Editor</option>
                <option value={4}>Viewer</option>
              </select>
            </div>

              {/* Action Buttons */}
              <div className="flex justify-between space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-grow px-6 py-3 bg-gray-100 text-gray-700 rounded-md shadow-md hover:bg-gray-200 transition dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-grow px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md shadow-md hover:opacity-90 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* this is the inivte model code of user*/}
      {isInviteModalOpen && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-75 border-2 border-teal-500">
          <div className="modal-content flex items-center justify-center w-full h-full">
            <div className="modal-form w-full max-w-xl p-6 bg-gray-800 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-white text-center">
                Invite New User
              </h2>
              <form onSubmit={handleInviteSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="newUserName"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Name:
                  </label>
                  <input
                    type="text"
                    id="newUserName"
                    className="mt-1 block w-full rounded-md bg-black text-white px-4 py-2 border-gray-700 shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    value={newUser.full_name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, full_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="newUserEmail"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Email:
                  </label>
                  <input
                    type="email"
                    id="newUserEmail"
                    className="mt-1 block w-full rounded-md bg-black text-white px-4 py-2 border-gray-700 shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="newUserNumber"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Number:
                  </label>
                  <input
                    type="number"
                    id="newUserNumber"
                    className="mt-1 block w-full rounded-md bg-black text-white px-4 py-2 border-gray-700 shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    value={newUser.phone_number}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phone_number: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="newUserCountry"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Country:
                  </label>
                  <input
                    type="text"
                    id="newUserCountry"
                    className="mt-1 block w-full rounded-md bg-black text-white px-4 py-2 border-gray-700 shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    value={newUser.country_code}
                    onChange={(e) =>
                      setNewUser({ ...newUser, country_code: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="newUserRole"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Role:
                  </label>
                  <select
                    id="newUserRole"
                    className="mt-1 block w-full rounded-md bg-black text-white px-4 py-2 border-gray-700 shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    value={newUser.role_id}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        role_id: parseInt(e.target.value),
                      })
                    }
                    required
                  >
                    <option value="1">Admin</option>
                    <option value="2">Sub-Admin</option>
                    <option value="3">Editor</option>
                    <option value="4">Viewer</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className="text-sm px-5 py-2 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700"
                    onClick={() => setIsInviteModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-sm px-5 py-2 bg-teal-700 text-white rounded-md shadow hover:bg-teal-800"
                  >
                    Invite
                  </button>
                </div>
              </form>
            </div>

            {/* Image Container */}
            <div className="modal-photo hidden md:block ml-6 w-96 ">
              <img
                src="https://static.vecteezy.com/system/resources/previews/026/295/154/non_2x/add-new-contact-pixel-perfect-glassmorphism-ui-icon-for-dark-theme-color-filled-line-element-with-transparency-isolated-pictogram-for-night-mode-editable-stroked-vector.jpg"
                alt="Invite"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUser;













import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUsersContext } from "../../contexts/UsersContext";
import { api } from "../../utils/api";
import "../../styles/Dashboard.css";

const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useUsersContext();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/admin/users/${id}`);
        if (response.data.success) {
          setUser(response.data.data.user);
          setForm(response.data.data.user);
        } else {
          setError(response.data.message || "Failed to fetch user");
        }
      } catch (err) {
        setError("Error fetching user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setForm(user);
    setEditMode(false);
  };
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleNestedChange = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        isVerified: form.isVerified,
        // Only send nested details for the user's role
        ...(form.role === "Patient" && { patientDetails: form.patientDetails }),
        ...(form.role === "Doctor" && { doctorDetails: form.doctorDetails }),
        ...(form.role === "ClinicStaff" && {
          clinicStaffDetails: form.clinicStaffDetails,
        }),
        ...(form.role === "Admin" && { adminDetails: form.adminDetails }),
      };
      const response = await api.put(`/admin/users/${id}`, payload);
      if (response.data.success) {
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
        setForm(updatedUser);
        setEditMode(false);
        // Update the user in the context
        dispatch({ type: "UPDATE_USER", payload: updatedUser });
        setError(null);
      } else {
        setError(response.data.message || "Failed to update user");
      }
    } catch (err) {
      setError("Error updating user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const response = await api.delete(`/admin/users/${id}`);
      if (response.data.success) {
        // Update the users list in context
        dispatch({ type: "DELETE_USER", payload: id });
        navigate("/dashboard/admin");
      } else {
        setError(response.data.message || "Failed to delete user");
      }
    } catch (err) {
      setError("Error deleting user");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner" style={{ margin: "4rem auto" }}></div>
    );
  }
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  if (!form) {
    return <div className="error-message">User not found.</div>;
  }

  return (
    <div
      className="auth-container"
      style={{ padding: "2rem", minHeight: "100vh" }}
    >
      <div
        className="auth-form-container"
        style={{
          maxWidth: 1000,
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: "2rem",
          marginBottom: "2rem",
        }}
      >
        <button
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
          style={{ marginBottom: "1rem" }}
        >
          Back
        </button>
        <div
          className="details-panel"
          style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}
        >
          {/* Left column: Basic Info */}
          <div style={{ flex: "1 1 280px", minWidth: 280 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h2 style={{ margin: 0 }}>User Details</h2>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {!editMode && (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={handleEdit}
                      style={{
                        width: "auto",
                        minWidth: "unset",
                        padding: "0.5rem 1.5rem",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={handleDelete}
                      disabled={deleting}
                      style={{
                        width: "auto",
                        minWidth: "unset",
                        padding: "0.5rem 1.5rem",
                      }}
                    >
                      {deleting ? "Deleting..." : "Delete User"}
                    </button>
                  </>
                )}
                {editMode && (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="btn btn-primary"
                      onClick={handleSave}
                      disabled={saving}
                      style={{
                        width: "auto",
                        minWidth: "unset",
                        padding: "0.5rem 1.5rem",
                      }}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleCancel}
                      disabled={saving}
                      style={{
                        width: "auto",
                        minWidth: "unset",
                        padding: "0.5rem 1.5rem",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p>
              <strong>Name:</strong>{" "}
              {editMode ? (
                <input
                  type="text"
                  value={form.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="auth-form input"
                />
              ) : (
                form.name || "None"
              )}
            </p>
            <p>
              <strong>Email:</strong> {form.email || "None"}
            </p>
            <div>
              <p>
                <strong>Role:</strong>
                {form.role}
              </p>
            </div>
            <p>
              <strong>Status:</strong>{" "}
              {editMode ? (
                <select
                  value={form.isVerified}
                  onChange={(e) =>
                    handleChange("isVerified", e.target.value === "true")
                  }
                  className="auth-form input"
                >
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </select>
              ) : (
                <span
                  className={`status-badge ${
                    form.isVerified ? "verified" : "unverified"
                  }`}
                >
                  {form.isVerified ? "Verified" : "Unverified"}
                </span>
              )}
            </p>
            <p>
              <strong>Phone:</strong>{" "}
              {editMode ? (
                <input
                  type="text"
                  value={form.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="auth-form input"
                />
              ) : (
                form.phone || "None"
              )}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {form.createdAt
                ? new Date(form.createdAt).toLocaleString()
                : "None"}
            </p>
            <p>
              <strong>Last Login:</strong>{" "}
              {form.lastLogin
                ? new Date(form.lastLogin).toLocaleString()
                : "None"}
            </p>
          </div>
          {/* Right column: Role-specific Details */}
          <div style={{ flex: "1 1 280px", minWidth: 280 }}>
            {form.role === "Patient" && (
              <>
                <h3>Patient Details</h3>
                <p>
                  <strong>Patient ID:</strong>{" "}
                  {editMode ? (
                    <input
                      type="text"
                      value={form.patientDetails?.patientID || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "patientDetails",
                          "patientID",
                          e.target.value
                        )
                      }
                      className="auth-form input"
                    />
                  ) : (
                    form.patientDetails?.patientID || "None"
                  )}
                </p>
                <p>
                  <strong>Date of Birth:</strong>{" "}
                  {editMode ? (
                    <input
                      type="date"
                      value={
                        form.patientDetails?.DOB
                          ? new Date(form.patientDetails.DOB)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleNestedChange(
                          "patientDetails",
                          "DOB",
                          e.target.value
                        )
                      }
                      className="auth-form input"
                    />
                  ) : form.patientDetails?.DOB ? (
                    new Date(form.patientDetails.DOB).toLocaleDateString()
                  ) : (
                    "None"
                  )}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {editMode ? (
                    <input
                      type="text"
                      value={form.patientDetails?.address || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "patientDetails",
                          "address",
                          e.target.value
                        )
                      }
                      className="auth-form input"
                    />
                  ) : (
                    form.patientDetails?.address || "None"
                  )}
                </p>
                <p>
                  <strong>Insurance Details:</strong>{" "}
                  {editMode ? (
                    <input
                      type="text"
                      value={form.patientDetails?.insuranceDetails || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "patientDetails",
                          "insuranceDetails",
                          e.target.value
                        )
                      }
                      className="auth-form input"
                    />
                  ) : form.patientDetails?.insuranceDetails ? (
                    JSON.stringify(form.patientDetails.insuranceDetails)
                  ) : (
                    "None"
                  )}
                </p>
              </>
            )}
            {form.role === "Doctor" && (
              <>
                <h3>Doctor Details</h3>
                <p>
                  <strong>Doctor ID:</strong>{" "}
                  {editMode ? (
                    <input
                      type="text"
                      value={form.doctorDetails?.doctorID || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "doctorDetails",
                          "doctorID",
                          e.target.value
                        )
                      }
                      className="auth-form input"
                    />
                  ) : (
                    form.doctorDetails?.doctorID || "None"
                  )}
                </p>
                <p>
                  <strong>Specialization:</strong>{" "}
                  {editMode ? (
                    <input
                      type="text"
                      value={form.doctorDetails?.specialization || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "doctorDetails",
                          "specialization",
                          e.target.value
                        )
                      }
                      className="auth-form input"
                    />
                  ) : (
                    form.doctorDetails?.specialization || "None"
                  )}
                </p>
                <p>
                  <strong>Availability Schedule:</strong>{" "}
                  {editMode ? (
                    <input
                      type="text"
                      value={
                        form.doctorDetails?.availabilitySchedule
                          ? form.doctorDetails.availabilitySchedule.join(", ")
                          : ""
                      }
                      onChange={(e) =>
                        handleNestedChange(
                          "doctorDetails",
                          "availabilitySchedule",
                          e.target.value.split(",").map((s) => s.trim())
                        )
                      }
                      className="auth-form input"
                      placeholder="Comma separated"
                    />
                  ) : form.doctorDetails?.availabilitySchedule &&
                    form.doctorDetails.availabilitySchedule.length > 0 ? (
                    form.doctorDetails.availabilitySchedule.join(", ")
                  ) : (
                    "None"
                  )}
                </p>
              </>
            )}
            {form.role === "ClinicStaff" && (
              <>
                <h3>Clinic Staff Details</h3>
                <p>
                  <strong>Staff ID:</strong>{" "}
                  {editMode ? (
                    <input
                      type="text"
                      value={form.clinicStaffDetails?.staffID || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "clinicStaffDetails",
                          "staffID",
                          e.target.value
                        )
                      }
                      className="auth-form input"
                    />
                  ) : (
                    form.clinicStaffDetails?.staffID || "None"
                  )}
                </p>
                <p>
                  <strong>Clinic Location:</strong>{" "}
                  {editMode ? (
                    <input
                      type="text"
                      value={form.clinicStaffDetails?.clinicLocation || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "clinicStaffDetails",
                          "clinicLocation",
                          e.target.value
                        )
                      }
                      className="auth-form input"
                    />
                  ) : (
                    form.clinicStaffDetails?.clinicLocation || "None"
                  )}
                </p>
              </>
            )}
            {form.role === "Admin" && (
              <>
                <h3>Admin Details</h3>
                <p>
                  <strong>Admin ID:</strong>{" "}
                  {editMode ? (
                    <input
                      type="text"
                      value={form.adminDetails?.adminID || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "adminDetails",
                          "adminID",
                          e.target.value
                        )
                      }
                      className="auth-form input"
                    />
                  ) : (
                    form.adminDetails?.adminID || "None"
                  )}
                </p>
              </>
            )}
            {/* Nurse: No extra details in model, but you can add if needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetails;

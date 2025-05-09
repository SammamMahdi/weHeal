import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import '../styles/DoctorProfile.css';

const DoctorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialization: '',
    yearsOfExperience: '',
    consultationFee: '',
    bio: '',
    languages: [],
    education: []
  });

  useEffect(() => {
    fetchProfile();
    fetchSpecializations();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/doctor/profile');
      if (response.data.success) {
        setProfile(response.data.data);
        setFormData({
          name: response.data.data.name || '',
          phone: response.data.data.phone || '',
          specialization: response.data.data.doctorDetails?.specialization || '',
          yearsOfExperience: response.data.data.doctorDetails?.yearsOfExperience || '',
          consultationFee: response.data.data.doctorDetails?.consultationFee || '',
          bio: response.data.data.doctorDetails?.bio || '',
          languages: response.data.data.doctorDetails?.languages || [],
          education: response.data.data.doctorDetails?.education || []
        });
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const response = await api.get('/doctor/specializations');
      if (response.data.success) {
        setSpecializations(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching specializations:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLanguageChange = (language) => {
    try {
      const updatedLanguages = formData.languages.includes(language)
        ? formData.languages.filter(l => l !== language)
        : [...formData.languages, language];
      
      console.log('Updating languages:', {
        current: formData.languages,
        adding: language,
        result: updatedLanguages
      });

      setFormData(prev => ({
        ...prev,
        languages: updatedLanguages
      }));
    } catch (err) {
      console.error('Error updating languages:', err);
      setError('Error updating languages. Please try again.');
    }
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...formData.education];
    if (!newEducation[index]) {
      newEducation[index] = { degree: '', institution: '', year: '' };
    }
    newEducation[index][field] = value;
    setFormData(prev => ({
      ...prev,
      education: newEducation
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '' }]
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      console.log('Submitting profile update:', formData);

      const dataToSubmit = {
        ...formData,
        languages: formData.languages || [],
        education: formData.education.map(edu => ({
          ...edu,
          year: parseInt(edu.year) || null
        }))
      };

      const response = await api.put('/doctor/profile', dataToSubmit);
      console.log('Profile update response:', response.data);

      if (response.data.success) {
        setProfile(response.data.data);
        setEditMode(false);
        setError(null);
      } else {
        setError(response.data.message || 'Error updating profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Error updating profile. Please check your input and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Doctor Profile</h2>
        <button 
          className={`btn ${editMode ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!editMode}
              required
              placeholder={formData.name || "Enter your name"}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!editMode}
              required
              placeholder={formData.phone || "Enter your phone number"}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Professional Details</h3>
          <div className="form-group">
            <label>Specialization</label>
            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              disabled={!editMode}
              required
            >
              <option value="">{formData.specialization || "Select Specialization"}</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Years of Experience</label>
            <input
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleInputChange}
              disabled={!editMode}
              min="0"
              max="50"
              required
              placeholder={formData.yearsOfExperience || "Years of experience"}
            />
          </div>
          <div className="form-group">
            <label>Consultation Fee</label>
            <input
              type="number"
              name="consultationFee"
              value={formData.consultationFee}
              onChange={handleInputChange}
              disabled={!editMode}
              min="0"
              required
              placeholder={formData.consultationFee || "Enter consultation fee"}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Education</h3>
          {formData.education.map((edu, index) => (
            <div key={index} className="education-entry">
              <div className="form-group">
                <label>Degree</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                  disabled={!editMode}
                  placeholder={edu.degree || "Enter degree"}
                  required
                />
              </div>
              <div className="form-group">
                <label>Institution</label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                  disabled={!editMode}
                  placeholder={edu.institution || "Enter institution name"}
                  required
                />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input
                  type="number"
                  value={edu.year}
                  onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                  disabled={!editMode}
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder={edu.year || "Year"}
                  required
                />
              </div>
              {editMode && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeEducation(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {editMode && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addEducation}
            >
              Add Education
            </button>
          )}
        </div>

        <div className="form-section">
          <h3>Languages</h3>
          <div className="languages-grid">
            {['English', 'Spanish', 'French', 'German', 'Chinese', 'Hindi', 'Arabic', 'Russian', 'Japanese', 'Korean', 'Bangla'].map(lang => (
              <label key={lang} className="language-checkbox">
                <input
                  type="checkbox"
                  checked={formData.languages.includes(lang)}
                  onChange={() => handleLanguageChange(lang)}
                  disabled={!editMode}
                />
                {lang}
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Bio</h3>
          <div className="form-group">
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={!editMode}
              maxLength="500"
              rows="4"
              placeholder={formData.bio || "Write a brief professional bio"}
            />
            <small>{formData.bio.length}/500 characters</small>
          </div>
        </div>

        {editMode && (
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default DoctorProfile; 
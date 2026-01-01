import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/api.js';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    timezone: 'UTC',
    studyHoursPerDay: 6,
    preferredTime: '09:00',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        timezone: user.timezone || 'UTC',
        studyHoursPerDay: user.studyHoursPerDay || 6,
        preferredTime: user.preferredTime || '09:00',
      });
    }
    setLoading(false);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'studyHoursPerDay' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.put('/user/settings', formData);
      // merge returned data into user context
      updateUser({ ...user, ...response.data });
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert(error.response?.data?.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  // Get common timezones
  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
  ];

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <>
      {/* --- ACCOUNT INFORMATION --- */}
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h2>Account Information</h2>
          </div>

          <div className="card-body">
            <div className="info-row">
              <strong>Name:</strong> {user?.name || '—'}
            </div>

            <div className="info-row">
              <strong>Email:</strong> {user?.email || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* --- SETTINGS FORM --- */}
      <div className="container" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <h2>Preferences</h2>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
              <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ marginRight: 12 }}>Timezone</label>
                <select name="timezone" value={formData.timezone} onChange={handleChange}>
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ marginRight: 12 }}>Study hours per day</label>
                <input
                  type="number"
                  name="studyHoursPerDay"
                  min={1}
                  max={24}
                  value={formData.studyHoursPerDay}
                  onChange={handleChange}
                  style={{ width: 100 }}
                />
              </div>

              <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ marginRight: 12 }}>Preferred start time</label>
                <input type="time" name="preferredTime" value={formData.preferredTime} onChange={handleChange} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="submit" className="btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    setFormData({
                      timezone: user?.timezone || 'UTC',
                      studyHoursPerDay: user?.studyHoursPerDay || 6,
                      preferredTime: user?.preferredTime || '09:00',
                    })
                  }
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* --- ABOUT THE DEVELOPMENT --- */}
      <div className="container" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="card-header">
            <h2>About the Development</h2>
          </div>

          <div className="card-body">
            <p style={{ marginBottom: '10px', lineHeight: '1.5' }}>
              StudyPlanner is a full–stack academic project built using the MERN stack (MongoDB, Express, React, Node.js). It includes features such as Task Management, Notes, Subjects, Timetable Generator, and User Authentication using JWT.
            </p>

            <p className="muted" style={{ fontSize: '14px' }}>
              The purpose of this project is to help students organize their work efficiently with a clean and easy-to-use interface.
            </p>
          </div>
        </div>
      </div>

      {/* --- ABOUT THE DEVELOPERS --- */}
      <div className="container" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="card-header">
            <h2>About the Developers</h2>
          </div>

          <div className="card-body">
            <p style={{ marginBottom: 12 }}>
              This StudyPlanner application was developed by our three-member team as an academic project.
            </p>

            {/* Developer list */}
            <div className="info-row" style={{ display: 'block', borderBottom: 'none' }}>
              <ul style={{ paddingLeft: 20, lineHeight: 1.6, margin: 0 }}>
                <li>
                  <strong>Sumanth Kuna</strong> — Frontend Development & UI/UX
                </li>
                <li>
                  <strong>Jithendra</strong> — Backend Development & Database
                </li>
                <li>
                  <strong>Shubham</strong> — Features, Testing & Integration
                </li>
              </ul>
            </div>

            {/* Contact Section */}
            <div className="info-row" style={{ display: 'block', borderBottom: 'none', marginTop: 10 }}>
              <strong>Contact us:</strong>
              <br />
              <a href="mailto:skilsoftwares@gmail.com" style={{ color: '#2563EB', textDecoration: 'none' }}>
                Skilsoftwares@gmail.com
              </a>
            </div>

            <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
              © {new Date().getFullYear()} StudyPlanner — Academic Project
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;

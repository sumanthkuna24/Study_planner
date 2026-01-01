import { useState, useEffect } from 'react';
import api from '../api/api.js';

const hourRange = Array.from({ length: 12 }, (_, i) => 8 + i); // 08..19

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [startRange, setStartRange] = useState(selectedDate);
  const [endRange, setEndRange] = useState(selectedDate);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const normalizeSlotsResponse = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.slots)) return data.slots;
    // handle case where API returns { slots: null } or other
    return [];
  };

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/timetable/day?date=${selectedDate}`);
      const normalized = normalizeSlotsResponse(res.data);
      // sort by start time
      normalized.sort((a, b) => new Date(a.start) - new Date(b.start));
      setSlots(normalized);
    } catch (err) {
      console.error('fetchSlots error', err);
      setError(err.response?.data?.message || err.message || 'Error fetching slots');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!startRange || !endRange) {
      alert('Please select a valid start and end date');
      return;
    }
    try {
      setGenerating(true);
      setError(null);
      await api.post('/timetable/generate', { startDate: startRange, endDate: endRange });
      // refresh current selected date
      await fetchSlots();
      alert('Timetable generated successfully');
    } catch (err) {
      console.error('generate error', err);
      setError(err.response?.data?.message || err.message || 'Error generating timetable');
      alert(error || 'Error generating timetable');
    } finally {
      setGenerating(false);
    }
  };

  const markDone = async (slotId) => {
    try {
      await api.post(`/timetable/${slotId}/done`);
      fetchSlots();
    } catch (err) {
      console.error('markDone error', err);
      alert('Unable to mark done');
    }
  };

  const getSlotForHour = (hour) => {
    return slots.find((s) => {
      const d = new Date(s.start);
      return d.getHours() === hour;
    });
  };

  const formatTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="page schedule-page container" style={{ padding: 18 }}>
      <h2 style={{ marginBottom: 12 }}>Schedule</h2>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <label>Selected date</label><br />
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>

        <div>
          <label>Generate range start</label><br />
          <input type="date" value={startRange} onChange={(e) => setStartRange(e.target.value)} />
        </div>

        <div>
          <label>Generate range end</label><br />
          <input type="date" value={endRange} onChange={(e) => setEndRange(e.target.value)} />
        </div>

        <div>
          <button onClick={handleGenerate} disabled={generating} className="btn">
            {generating ? 'Generating...' : 'Generate Timetable'}
          </button>
        </div>

        <div style={{ marginLeft: 'auto', color: '#6b7280' }}>
          {loading ? 'Loading slots...' : `${slots.length} slot(s)`}
        </div>
      </div>

      {error && (
        <div style={{ color: '#b91c1c', marginBottom: 12 }}>
          Error: {error}
        </div>
      )}

      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '84px 1fr', gap: 8 }}>
          {hourRange.map((hour) => {
            const slot = getSlotForHour(hour);
            const label = `${hour.toString().padStart(2, '0')}:00`;

            return (
              <div key={hour} style={{ display: 'contents' }}>
                <div style={{ padding: 8, borderRight: '1px solid #eee', color: '#374151' }}>{label}</div>
                <div style={{ padding: 8, border: '1px solid #eee', minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {slot ? (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', width: '100%' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{slot.task?.title || 'Task'}</div>
                        {slot.task?.subject && (
                          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
                            {slot.task.subject.title}
                          </div>
                        )}
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
                          {formatTime(slot.start)} — {formatTime(slot.end)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
                        <button onClick={() => markDone(slot._id)} className="btn btn-outline">
                          Mark Done
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#9CA3AF' }}>Free</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Schedule;

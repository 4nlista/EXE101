import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Check, User, Phone, Calendar, MapPin, Building2, Briefcase, 
  GraduationCap, Plus, Code, PenTool, LayoutTemplate, Target, ChevronDown
} from 'lucide-react';
import axiosClient from '../../utils/axiosClient';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileSetupModal({ onClose, onComplete, initialName = '' }) {
  const { completeProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dữ liệu 4 bước theo Schema
  const [data, setData] = useState({
    // Bước 1: Cá nhân
    name: initialName, phone: '', dob: '', address: '',
    // Bước 2: Học tập
    semester: '', majorId: '', specializationId: '',
    // Bước 3: Năng lực
    mainSkills: [], strengths: '', weaknesses: '', projectHistory: '',
    // Bước 4: Mục tiêu
    gradeGoal: ''
  });

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));
  
  const [err1, setErr1] = useState({});
  const [err2, setErr2] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [skillMenuOpen, setSkillMenuOpen] = useState(false);
  const skillRef = useRef(null);

  // Sync initialName if it comes late
  useEffect(() => {
    if (initialName && !data.name) set('name', initialName);
  }, [initialName]);

  // Handle click outside for skills dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (skillRef.current && !skillRef.current.contains(e.target)) {
        setSkillMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Master Data States
  const [majors, setMajors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [skillsList, setSkillsList] = useState([]);

  // Fetch Majors & Skills on Mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [majorsRes, skillsRes] = await Promise.all([
          axiosClient.get('/master-data/majors'),
          axiosClient.get('/master-data/skills')
        ]);
        if (majorsRes.success) setMajors(majorsRes.data);
        if (skillsRes.success) setSkillsList(skillsRes.data);
      } catch (err) {
        console.error('Failed to fetch master data:', err);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch Specializations when Major changes
  useEffect(() => {
    if (!data.majorId) {
      setSpecializations([]);
      set('specializationId', '');
      return;
    }
    const fetchSpecs = async () => {
      try {
        const res = await axiosClient.get(`/master-data/specializations/${data.majorId}`);
        if (res.success) setSpecializations(res.data);
      } catch (err) {
        console.error('Failed to fetch specializations:', err);
      }
    };
    fetchSpecs();
  }, [data.majorId]);

  // Validation các bước
  const next1 = () => {
    if (!data.name) { setErr1({ name: 'Vui lòng nhập họ và tên' }); return; }
    setStep(2);
  };
  const next2 = () => {
    if (!data.majorId) { setErr2({ majorId: 'Vui lòng nhập chuyên ngành' }); return; }
    setStep(3);
  };
  const next3 = () => {
    setStep(4);
  };

  // Quản lý tags kỹ năng
  const handleAddSkill = (s) => {
    if (s && !data.mainSkills.includes(s)) set('mainSkills', [...data.mainSkills, s]);
    setTagInput(''); setSkillMenuOpen(false);
  };
  const removeSkill = (s) => set('mainSkills', data.mainSkills.filter(x => x !== s));

  // Submit form lên API
  const handleSubmit = async () => {
    // Validate gradeGoal
    if (data.gradeGoal) {
      const numGoal = Number(data.gradeGoal);
      if (isNaN(numGoal) || numGoal < 0 || numGoal > 4) {
        setErrorMsg('Mục tiêu điểm số phải nằm trong thang điểm 4.0 (từ 0.0 đến 4.0)');
        return;
      }
    }

    setLoading(true);
    setErrorMsg('');

    // Chuẩn bị payload chuẩn với Database
    const payload = { ...data };
    
    if (payload.gradeGoal) {
      payload.gradeGoal = Number(payload.gradeGoal);
    } else {
      delete payload.gradeGoal;
    }

    if (payload.projectHistory && typeof payload.projectHistory === 'string') {
      payload.projectHistory = [{
        projectName: 'Dự án / Kinh nghiệm',
        role: 'Cá nhân',
        description: payload.projectHistory
      }];
    } else {
      payload.projectHistory = [];
    }

    try {
      const response = await axiosClient.put('/users/profile/setup', payload);
      if (response.success) {
        // Cập nhật context local
        completeProfile({ name: data.name });
        if (onComplete) onComplete(data);
        if (onClose) onClose();
      } else {
        setErrorMsg(response.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ background: '#f8f9fa' }}>
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-top">
            <div>
              <div className="modal-title">Hoàn thiện hồ sơ</div>
              <div className="modal-sub">Cập nhật thông tin để hệ thống kết nối bạn tốt hơn</div>
            </div>
            <button className="modal-skip" onClick={() => { if(onClose) onClose(); }}>Bỏ qua / Lưu sau</button>
          </div>
          
          {/* STEPPER 4 BƯỚC */}
          <div className="stepper">
            {/* Bước 1 */}
            <div className={`stepper-step ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}>
              <div className="step-num">{step > 1 ? <Check size={14} /> : '1'}</div>
              <div className="step-label">Cá nhân</div>
            </div>
            <div className={`step-line ${step > 1 ? 'done' : ''}`} />
            
            {/* Bước 2 */}
            <div className={`stepper-step ${step >= 2 ? (step > 2 ? 'done' : 'active') : ''}`}>
              <div className="step-num">{step > 2 ? <Check size={14} /> : '2'}</div>
              <div className="step-label">Học tập</div>
            </div>
            <div className={`step-line ${step > 2 ? 'done' : ''}`} />
            
            {/* Bước 3 */}
            <div className={`stepper-step ${step >= 3 ? (step > 3 ? 'done' : 'active') : ''}`}>
              <div className="step-num">{step > 3 ? <Check size={14} /> : '3'}</div>
              <div className="step-label">Năng lực</div>
            </div>
            <div className={`step-line ${step > 3 ? 'done' : ''}`} />

            {/* Bước 4 */}
            <div className={`stepper-step ${step >= 4 ? 'active' : ''}`}>
              <div className="step-num">4</div>
              <div className="step-label">Mục tiêu</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {errorMsg && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              <span>⚠️</span> {errorMsg}
            </div>
          )}

          {/* BƯỚC 1: CÁ NHÂN */}
          {step === 1 && (
            <div>
              <div className="s-label">Thông tin cơ bản</div>
              <div className="g2">
                <div className="field gc2">
                  <label className="field-label">Họ và tên *</label>
                  <div className="input-box">
                    <User className="input-icon" size={16} />
                    <input 
                      className={`input${err1.name ? ' err' : ''}`} type="text" placeholder="Nguyễn Văn A"
                      value={data.name} onChange={e => { set('name', e.target.value); setErr1({}); }}
                    />
                  </div>
                  {err1.name && <span className="field-error">{err1.name}</span>}
                </div>
                
                <div className="field">
                  <label className="field-label">Số điện thoại</label>
                  <div className="input-box">
                    <Phone className="input-icon" size={16} />
                    <input className="input" type="tel" placeholder="09xx xxx xxx"
                      value={data.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Ngày sinh</label>
                  <div className="input-box">
                    <Calendar className="input-icon" size={16} />
                    <input className="input" type="date"
                      value={data.dob} onChange={e => set('dob', e.target.value)} />
                  </div>
                </div>

                <div className="field gc2" style={{ marginBottom: 0 }}>
                  <label className="field-label">Địa chỉ</label>
                  <div className="input-box">
                    <MapPin className="input-icon" size={16} />
                    <input className="input" type="text" placeholder="Hà Nội, Việt Nam"
                      value={data.address} onChange={e => set('address', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BƯỚC 2: HỌC TẬP */}
          {step === 2 && (
            <div>
              <div className="s-label">Thông tin Học tập</div>
              <div className="field">
                <label className="field-label">Học kỳ hiện tại</label>
                <div className="input-box">
                  <GraduationCap className="input-icon" size={16} />
                  <input className="input" type="number" placeholder="Ví dụ: Kỳ 5"
                    value={data.semester} onChange={e => set('semester', e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label className="field-label">Chuyên ngành chính *</label>
                <div className="input-box" style={{ paddingRight: 10 }}>
                  <Building2 className="input-icon" size={16} />
                  <select 
                    className={`input${err2.majorId ? ' err' : ''}`} 
                    value={data.majorId} 
                    onChange={e => { set('majorId', e.target.value); setErr2({}); }}
                    style={{ appearance: 'none', background: 'transparent' }}
                  >
                    <option value="">-- Chọn chuyên ngành --</option>
                    {majors.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
                {err2.majorId && <span className="field-error">{err2.majorId}</span>}
              </div>

              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field-label">Chuyên ngành hẹp</label>
                <div className="input-box" style={{ paddingRight: 10 }}>
                  <Code className="input-icon" size={16} />
                  <select 
                    className="input" 
                    value={data.specializationId} 
                    onChange={e => set('specializationId', e.target.value)}
                    style={{ appearance: 'none', background: 'transparent' }}
                    disabled={!data.majorId || specializations.length === 0}
                  >
                    <option value="">-- Chọn chuyên ngành hẹp --</option>
                    {specializations.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            </div>
          )}

          {/* BƯỚC 3: HỒ SƠ NĂNG LỰC */}
          {step === 3 && (
            <div>
              <div className="s-label">Hồ sơ năng lực</div>
              
              <div className="field">
                <label className="field-label">Kỹ năng chính</label>
                <div className="tag-hint">Nhập và ấn Enter để thêm kỹ năng</div>
                <div className="tag-field" ref={skillRef} onClick={() => setSkillMenuOpen(true)}>
                  {data.mainSkills.map(s => (
                    <div key={s} className="tag">
                      {s} <button className="tag-x" onClick={(e) => { e.stopPropagation(); removeSkill(s); }}><X size={10} /></button>
                    </div>
                  ))}
                  <div className="msel" style={{ flex: 1, margin: 0 }}>
                    <input 
                      type="text" className="tag-bare" placeholder={data.mainSkills.length ? "" : "Gõ tên kỹ năng..."}
                      value={tagInput} onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(tagInput); }
                      }}
                    />
                    {skillMenuOpen && (
                      <div className="msel-dropdown" style={{ top: 30 }}>
                        {skillsList.filter(s => !data.mainSkills.includes(s) && s.toLowerCase().includes(tagInput.toLowerCase())).map(s => (
                          <div key={s} className="msel-opt" onClick={() => handleAddSkill(s)}>{s}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="g2">
                <div className="field">
                  <label className="field-label">Điểm mạnh</label>
                  <textarea className="input" rows={3} style={{ height: 'auto', resize: 'vertical' }} placeholder="Chăm chỉ, hòa đồng..."
                    value={data.strengths} onChange={e => set('strengths', e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">Điểm yếu</label>
                  <textarea className="input" rows={3} style={{ height: 'auto', resize: 'vertical' }} placeholder="Chưa thạo tiếng anh..."
                    value={data.weaknesses} onChange={e => set('weaknesses', e.target.value)} />
                </div>
              </div>

              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field-label">Lịch sử dự án</label>
                <textarea className="input" rows={2} style={{ height: 'auto', resize: 'vertical' }} placeholder="Ví dụ: Tham gia 2 dự án web FPT"
                  value={data.projectHistory} onChange={e => set('projectHistory', e.target.value)} />
              </div>
            </div>
          )}

          {/* BƯỚC 4: MỤC TIÊU */}
          {step === 4 && (
            <div>
              <div className="s-label">Mục tiêu</div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field-label">Mục tiêu điểm số (Thang 4.0)</label>
                <div className="input-box">
                  <Target className="input-icon" size={16} />
                  <input className="input" type="number" step="0.1" min="0" max="4" placeholder="Ví dụ: 3.5"
                    value={data.gradeGoal} onChange={e => { set('gradeGoal', e.target.value); setErrorMsg(''); }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="modal-step-info">Bước {step} / 4</div>
          <div className="modal-footer-btns">
            {step > 1 && <button className="btn btn-secondary" onClick={() => setStep(step - 1)} disabled={loading}>Quay lại</button>}
            
            {step === 1 && <button className="btn btn-primary" onClick={next1}>Tiếp tục</button>}
            {step === 2 && <button className="btn btn-primary" onClick={next2}>Tiếp tục</button>}
            {step === 3 && <button className="btn btn-primary" onClick={next3}>Tiếp tục</button>}
            
            {step === 4 && (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <span className="spinner" /> : 'Hoàn tất'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

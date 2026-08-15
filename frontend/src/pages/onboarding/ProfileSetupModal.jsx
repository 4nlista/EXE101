import React, { useState } from 'react';
import { 
  X, Check, User, Phone, Calendar, MapPin, Building2, Briefcase, 
  GraduationCap, Plus, Code, PenTool, LayoutTemplate
} from 'lucide-react';

const SKILLS = [
  'React', 'Node.js', 'Figma', 'Python', 'Marketing', 
  'Data Analysis', 'UI/UX Design', 'Project Management'
];
const ROLES = ['Frontend', 'Backend', 'Fullstack', 'Designer', 'BA', 'Data Scientist', 'Marketing'];

export default function ProfileSetupModal({ onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    name: '', phone: '', dob: '', address: '', avatar: null,
    type: '', org: '', role: '',
    skills: [], goals: []
  });

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));
  
  const [err1, setErr1] = useState({});
  const [err2, setErr2] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [skillMenuOpen, setSkillMenuOpen] = useState(false);

  const next1 = () => {
    if (!data.name) { setErr1({ name: 'Vui lòng nhập tên' }); return; }
    setStep(2);
  };
  const next2 = () => {
    if (!data.type) { setErr2({ type: 'Vui lòng chọn vai trò' }); return; }
    setStep(3);
  };

  const handleAddSkill = (s) => {
    if (s && !data.skills.includes(s)) set('skills', [...data.skills, s]);
    setTagInput(''); setSkillMenuOpen(false);
  };

  const removeSkill = (s) => set('skills', data.skills.filter(x => x !== s));

  const toggleGoal = (g) => {
    const goals = data.goals.includes(g) 
      ? data.goals.filter(x => x !== g)
      : [...data.goals, g];
    set('goals', goals);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-top">
            <div>
              <div className="modal-title">Hoàn thiện hồ sơ</div>
              <div className="modal-sub">Cập nhật thông tin để kết nối tốt hơn</div>
            </div>
            <button className="modal-skip" onClick={() => onComplete(data)}>Bỏ qua / Lưu sau</button>
          </div>
          
          <div className="stepper">
            <div className={`stepper-step ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}>
              <div className="step-num">{step > 1 ? <Check size={14} /> : '1'}</div>
              <div className="step-label">Cá nhân</div>
            </div>
            <div className={`step-line ${step > 1 ? 'done' : ''}`} />
            <div className={`stepper-step ${step >= 2 ? (step > 2 ? 'done' : 'active') : ''}`}>
              <div className="step-num">{step > 2 ? <Check size={14} /> : '2'}</div>
              <div className="step-label">Công việc</div>
            </div>
            <div className={`step-line ${step > 2 ? 'done' : ''}`} />
            <div className={`stepper-step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-num">3</div>
              <div className="step-label">Mục tiêu</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {step === 1 && (
            <div>
              <div className="s-label">Thông tin cơ bản</div>
              <div className="avatar-block">
                <div className="avatar-circle">
                  <User size={28} />
                </div>
                <div className="avatar-info">
                  <h4>Ảnh đại diện</h4>
                  <p>PNG, JPG (Tối đa 2MB)</p>
                  <button className="btn btn-secondary btn-sm">Tải ảnh lên</button>
                </div>
              </div>

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

          {step === 2 && (
            <div>
              <div className="s-label">Định danh chuyên môn</div>
              <div className="opt-grid-2">
                <div className="opt-card">
                  <input type="radio" id="t-pro" name="type" checked={data.type==='pro'} onChange={() => {set('type', 'pro'); setErr2({})}} />
                  <label htmlFor="t-pro"><Briefcase size={16} /> Người đi làm / Freelancer</label>
                </div>
                <div className="opt-card">
                  <input type="radio" id="t-stu" name="type" checked={data.type==='stu'} onChange={() => {set('type', 'stu'); setErr2({})}} />
                  <label htmlFor="t-stu"><GraduationCap size={16} /> Sinh viên</label>
                </div>
              </div>
              {err2.type && <div className="field-error" style={{ marginTop: 6 }}>{err2.type}</div>}

              <div className="s-divider" />

              <div className="field">
                <label className="field-label">Tổ chức / Công ty / Trường học</label>
                <div className="input-box">
                  <Building2 className="input-icon" size={16} />
                  <input className="input" type="text" placeholder="Ví dụ: ĐH Bách Khoa, FPT Software..."
                    value={data.org} onChange={e => set('org', e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label className="field-label">Vị trí / Chuyên môn chính</label>
                <div className="input-box">
                  <Code className="input-icon" size={16} />
                  <select className="input no-icon" value={data.role} onChange={e => set('role', e.target.value)} style={{ paddingLeft: 36, appearance: 'none' }}>
                    <option value="" disabled>-- Chọn vị trí --</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field-label">Kỹ năng mềm & cứng</label>
                <div className="tag-hint">Nhập và ấn Enter để thêm kỹ năng</div>
                <div className="tag-field" onClick={() => setSkillMenuOpen(true)}>
                  {data.skills.map(s => (
                    <div key={s} className="tag">
                      {s} <button className="tag-x" onClick={(e) => { e.stopPropagation(); removeSkill(s); }}><X size={10} /></button>
                    </div>
                  ))}
                  <div className="msel" style={{ flex: 1, margin: 0 }}>
                    <input 
                      type="text" className="tag-bare" placeholder={data.skills.length ? "" : "Gõ tên kỹ năng..."}
                      value={tagInput} onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(tagInput); }
                      }}
                    />
                    {skillMenuOpen && (
                      <div className="msel-dropdown" style={{ top: 30 }}>
                        {SKILLS.filter(s => !data.skills.includes(s) && s.toLowerCase().includes(tagInput.toLowerCase())).map(s => (
                          <div key={s} className="msel-opt" onClick={() => handleAddSkill(s)}>{s}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="s-label">Bạn đang tìm kiếm gì?</div>
              <div className="goal-list">
                {[
                  { id: 'g1', title: 'Tìm đồng đội làm Side-project / Startup', desc: 'Kết nối với các nhà phát triển, designer, hoặc marketer' },
                  { id: 'g2', title: 'Tìm nhóm Đồ án / Bài tập lớn', desc: 'Dành cho sinh viên cần ghép nhóm môn học' },
                  { id: 'g3', title: 'Tìm việc Freelance / Hợp đồng ngắn hạn', desc: 'Sẵn sàng nhận các công việc part-time hoặc freelance' },
                  { id: 'g4', title: 'Mentor / Cố vấn dự án', desc: 'Tôi muốn tìm người hướng dẫn hoặc sẵn sàng làm mentor' },
                ].map(g => (
                  <div className="goal-card" key={g.id}>
                    <input type="checkbox" id={g.id} checked={data.goals.includes(g.id)} onChange={() => toggleGoal(g.id)} />
                    <label htmlFor={g.id}>
                      <div className="goal-chk"><Check size={12} strokeWidth={3} /></div>
                      <div className="goal-text">
                        <h4>{g.title}</h4>
                        <p>{g.desc}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="modal-step-info">Bước {step} / 3</div>
          <div className="modal-footer-btns">
            {step > 1 && <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>Quay lại</button>}
            {step < 3 ? (
              <button className="btn btn-primary" onClick={step === 1 ? next1 : next2}>Tiếp tục</button>
            ) : (
              <button className="btn btn-primary" onClick={() => onComplete(data)}>Hoàn tất</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

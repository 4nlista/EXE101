// ============================================================
//  UNIVERSE AI — Mock Data
//  Dùng để giả lập backend trong quá trình phát triển UI
// ============================================================

export const MOCK_OTP = '1234';

export const MOCK_USERS = [
  {
    id: 1,
    email: 'demo@universe.ai',
    password: 'Demo@123',
    name: 'Nguyễn Văn Demo',
    avatar: null,
    isProfileComplete: true,
    occupation: 'employee',
    organization: 'FPT Software',
    skills: ['ReactJS', 'Node.js', 'MongoDB'],
    level: 'mid',
    fields: ['IT'],
  },
  {
    id: 2,
    email: 'test@gmail.com',
    password: 'Test@123',
    name: 'Trần Thị Test',
    avatar: null,
    isProfileComplete: false,
    occupation: 'student',
    organization: 'Đại học Bách Khoa TP.HCM',
    skills: [],
    level: '',
    fields: [],
  },
];

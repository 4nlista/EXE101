// ============================================================
//  UNIVERSE AI — Mock Data
//  Dùng để giả lập backend trong quá trình phát triển UI (Sprint 2)
// ============================================================

export const MOCK_OTP = '1234';

export const ENUM_MAJORS = [
  'An toàn thông tin',
  'Kỹ thuật phần mềm',
  'Thiết kế đồ họa',
  'Tự động hóa',
  'Marketing',
  'Truyền thông',
  'Kinh tế',
  'Quản trị kinh doanh',
  'Logistics',
  'Trí tuệ nhân tạo'
];

export const ENUM_UNIVERSITIES = [
  'Đại học Bách khoa Hà Nội',
  'Đại học Quốc gia Hà Nội',
  'Đại học Kinh tế Quốc dân',
  'Đại học Ngoại thương',
  'Đại học Xây dựng Hà Nội',
  'Đại học Giao thông vận tải',
  'Đại học Mỏ - Địa chất',
  'Đại học Công đoàn',
  'Đại học Dược Hà Nội',
  'Đại học Sư phạm Hà Nội',
  'Cao đẳng Y tế Thái Nguyên',
  'Cao đẳng Công nghiệp Hưng Yên',
  'Cao đẳng Công nghiệp và Xây dựng (Quảng Ninh)',
  'Đại học RMIT Việt Nam',
  'Đại học FPT',
  'Đại học Tôn Đức Thắng',
  'Đại học Khoa học Xã hội và Nhân văn'
];

export const MOCK_USERS = [
  {
    id: 1,
    email: 'quan.tran@gmail.com',
    password: 'Demo@123',
    name: 'Trần Minh Quân',
    avatarText: 'TQ',
    isProfileComplete: true,
    occupation: 'student',
    organization: 'Đại học Bách khoa Hà Nội',
    skills: ['ReactJS', 'Node.js', 'MongoDB', 'Go'],
    level: 'mid',
    fields: ['Kỹ thuật phần mềm'],
  },
  {
    id: 2,
    email: 'hoangle.studio@gmail.com',
    password: 'Demo@123',
    name: 'Hoàng Lê',
    avatarText: 'HL',
    isProfileComplete: true,
    occupation: 'employee',
    organization: 'Studio X',
    skills: ['Figma', 'Illustrator', 'Spine 2D'],
    level: 'senior',
    fields: ['Thiết kế đồ họa'],
  },
  {
    id: 3,
    email: 'nguyen.le@gmail.com',
    password: 'Demo@123',
    name: 'Lê Nguyên',
    avatarText: 'LN',
    isProfileComplete: true,
    occupation: 'employee',
    organization: 'Tech Corp',
    skills: ['Solidity', 'Rust', 'Web3', 'Blockchain'],
    level: 'senior',
    fields: ['Kỹ thuật phần mềm'],
  },
  {
    id: 4,
    email: 'annguyen@ussh.edu.vn',
    password: 'Demo@123',
    name: 'An Nguyễn',
    avatarText: 'TT',
    isProfileComplete: true,
    occupation: 'student',
    organization: 'Đại học Khoa học Xã hội và Nhân văn',
    skills: ['Content Writing', 'Event Management'],
    level: 'junior',
    fields: ['Truyền thông'],
  },
  {
    id: 5,
    email: 'hoang.lan@gmail.com',
    password: 'Demo@123',
    name: 'Hoàng Lan',
    avatarText: 'HL',
    isProfileComplete: true,
    occupation: 'student',
    organization: 'Đại học Kinh tế Quốc dân',
    skills: ['Data Analysis', 'Market Research', 'Excel'],
    level: 'fresher',
    fields: ['Kinh tế'],
  },
  {
    id: 6,
    email: 'le.anh@gmail.com',
    password: 'Demo@123',
    name: 'Lê Anh',
    avatarText: 'LA',
    isProfileComplete: true,
    occupation: 'student',
    organization: 'Đại học FPT',
    skills: ['UI/UX', 'HTML/CSS'],
    level: 'mid',
    fields: ['Thiết kế đồ họa', 'Kỹ thuật phần mềm'],
  },
  {
    id: 7,
    email: 'minh.tuan@rmit.edu.vn',
    password: 'Demo@123',
    name: 'Minh Tuấn',
    avatarText: 'MT',
    isProfileComplete: true,
    occupation: 'student',
    organization: 'Đại học RMIT Việt Nam',
    skills: ['Business Strategy', 'Presentation', 'Figma'],
    level: 'mid',
    fields: ['Quản trị kinh doanh'],
  },
  {
    id: 8,
    email: 'bds.group@gmail.com',
    password: 'Demo@123',
    name: 'BDS Group',
    avatarText: 'BD',
    isProfileComplete: true,
    occupation: 'employee',
    organization: 'BDS Group',
    skills: ['SEO', 'Digital Marketing', 'Google Ads'],
    level: 'senior',
    fields: ['Marketing'],
  },
  {
    id: 999, // Current User Mock
    email: 'demo@universe.ai',
    password: 'Demo@123',
    name: 'Người Dùng Hiện Tại',
    avatarText: 'ND',
    isProfileComplete: true,
    occupation: 'student',
    organization: 'Đại học Quốc gia Hà Nội',
    skills: ['Javascript', 'Python'],
    level: 'mid',
    fields: ['Kỹ thuật phần mềm'],
  }
];

export const MOCK_PROJECTS = [
  // Premium - Sinh Viên
  {
    id: 101,
    package: 'premium',
    title: 'Phân tích Data Customer',
    authorId: 1,
    school: 'Đại học Bách khoa Hà Nội',
    target: 'student',
    targetScore: '8.5',
    match: 'Phù hợp 98%',
    timeLeft: 'Còn 1 ngày',
    desc: 'Cần bạn làm Data Analyst, có khả năng dùng Python/R để clean data và viz bằng PowerBI.',
    roles: [{ name: 'Data Analyst', quantity: 2 }, { name: 'Data Engineer', quantity: 1 }]
  },
  {
    id: 102,
    package: 'premium',
    title: 'Thiết kế Game Mobile 2D',
    authorId: 2,
    school: 'Đại học RMIT Việt Nam',
    target: 'student',
    targetScore: '8.0',
    timeLeft: 'Còn 3 ngày',
    desc: 'Tuyển 2D Artist vẽ nhân vật phong cách Anime/Chibi. Làm remote part-time.',
    roles: [{ name: '2D Artist', quantity: 3 }, { name: 'Animator', quantity: 1 }]
  },
  {
    id: 103,
    package: 'premium',
    title: 'Fullstack Dev - Web3 Dapp',
    authorId: 3,
    target: 'student',
    targetScore: '9.0',
    match: 'Phù hợp 85%',
    timeLeft: 'Còn 5 ngày',
    desc: 'Khởi nghiệp Web3 cần Dev làm Nodejs/React. Trả lương hoặc shares.',
    roles: [{ name: 'Frontend', quantity: 2 }, { name: 'Backend Nodejs', quantity: 2 }, { name: 'Smart Contract', quantity: 1 }]
  },
  // VIP - Sinh viên
  {
    id: 104,
    package: 'vip',
    title: 'Trợ lý Marketing Sinh Viên',
    authorId: 4,
    school: 'Đại học Khoa học Xã hội và Nhân văn',
    target: 'student',
    targetScore: '8.2',
    timeLeft: 'Còn 2 ngày',
    desc: 'Lên kế hoạch content fanpage và tổ chức event nội bộ.',
    roles: [{ name: 'Content Creator', quantity: 2 }, { name: 'Designer', quantity: 1 }]
  },
  {
    id: 105,
    package: 'vip',
    title: 'Nghiên cứu thị trường F&B',
    authorId: 5,
    school: 'Đại học Kinh tế Quốc dân',
    target: 'student',
    targetScore: '7.5',
    match: 'Phù hợp 90%',
    timeLeft: 'Còn 1 tuần',
    desc: 'Đi khảo sát, gọi điện thoại lấy insight khách hàng cho chuỗi cafe mới.',
    roles: [{ name: 'Market Researcher', quantity: 4 }]
  },
  // Normal - Sinh Viên
  {
    id: 1,
    title: 'Tái thiết kế trang Thương mại Điện tử',
    authorId: 6,
    school: 'Đại học FPT',
    target: 'student',
    targetScore: '8.8',
    timeLeft: 'Còn 3 ngày',
    desc: 'Tìm kiếm UI/UX Designer sáng tạo và Frontend Developer để cải tiến trang web.',
    roles: [{ name: 'Thiết kế', quantity: 1 }, { name: 'Frontend', quantity: 2 }]
  },
  {
    id: 2,
    title: 'Tài liệu Pitching Startup Công nghệ',
    authorId: 7,
    school: 'Đại học RMIT Việt Nam',
    target: 'student',
    targetScore: '9.2',
    match: 'Phù hợp 92%',
    timeLeft: 'Còn 1 tuần',
    desc: 'Cần một trưởng nhóm có tư duy kinh doanh và một designer để giúp xây dựng bộ tài liệu pitching.',
    roles: [{ name: 'Trưởng nhóm', quantity: 1 }, { name: 'Thiết kế', quantity: 1 }]
  },

  // Premium - Đi làm
  {
    id: 201,
    package: 'premium',
    title: 'Lead Backend Engineer (Go/Nodejs)',
    authorId: 3,
    target: 'professional',
    salary: '2000 - 3000$',
    match: 'Phù hợp 99%',
    timeLeft: 'Còn 2 ngày',
    desc: 'Tuyển gấp Lead Backend. Range lương 2000-3000$. Làm việc tại Quận 1, TPHCM.',
    roles: [{ name: 'Lead Backend', quantity: 1 }]
  },
  {
    id: 202,
    package: 'premium',
    title: 'Product Manager - EdTech',
    authorId: 3,
    target: 'professional',
    timeLeft: 'Còn 4 ngày',
    desc: 'Cần PM có kinh nghiệm làm các sản phẩm Edtech. Lương thỏa thuận.',
    roles: [{ name: 'Product Manager', quantity: 1 }, { name: 'Business Analyst', quantity: 1 }]
  },
  // VIP - Đi làm
  {
    id: 204,
    package: 'vip',
    title: 'Chuyên viên SEO / Digital Marketing',
    authorId: 8,
    target: 'professional',
    timeLeft: 'Còn 10 ngày',
    desc: 'Đẩy top từ khóa mảng Bất động sản. Cần rank top 5 Google trong 3 tháng.',
    roles: [{ name: 'SEO Specialist', quantity: 2 }, { name: 'Content Writer', quantity: 2 }]
  }
];

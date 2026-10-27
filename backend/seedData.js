/**
 * SEED DATA CHO DỰ ÁN UNIVERSE AI (EXE101)
 * Tạo dữ liệu mẫu phong phú: Kỹ năng, Người dùng (Sinh viên), Lịch sử dự án,
 * Bài đăng tuyển dụng, Đơn ứng tuyển kèm điểm số AI, Đánh giá (Review), Gói VIP/Premium.
 * 
 * Chạy lệnh: node seedData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import Models
const User = require('./src/models/User');
const Role = require('./src/models/Role');
const Department = require('./src/models/Department');
const Major = require('./src/models/Major');
const Skill = require('./src/models/Skill');
const Project = require('./src/models/Project');
const ProjectHistory = require('./src/models/ProjectHistory');
const Application = require('./src/models/Application');
const Review = require('./src/models/Review');
const Subscription = require('./src/models/Subscription');
const Transaction = require('./src/models/Transaction');

// Import Enums
const { ROLE_CODE } = require('./src/constants/roleEnum');
const { IS_ACTIVE, PROJECT_HISTORY_TYPE, PROJECT_HISTORY_ROLE } = require('./src/constants/userEnum');
const { PROJECT_STATUS } = require('./src/constants/projectEnum');
const { PACKAGE_TYPE, SUBSCRIPTION_STATUS } = require('./src/constants/subscriptionEnum');
const { APPLICATION_STATUS } = require('./src/constants/applicationEnum');
const { TRANSACTION_STATUS, PAYMENT_METHOD } = require('./src/constants/transactionEnum');

// Kho avatar sinh viên chân thực (Unsplash portraits)
const AVATARS = {
  male: [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80',
  ],
  female: [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1514315384763-ba401779410f?auto=format&fit=crop&w=400&q=80',
  ]
};

// Danh sách kỹ năng mở rộng đa ngành
const SKILLS_CATALOG = [
  'ReactJS', 'Node.js', 'Python', 'TypeScript', 'Next.js',
  'Java / Spring Boot', 'Docker / DevOps', 'Flutter / Mobile', 'MongoDB / MySQL', 'FastAPI',
  'Trí tuệ nhân tạo (AI)', 'Machine Learning', 'Prompt Engineering', 'Data Analytics', 'Computer Vision',
  'UI/UX Design', 'Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe Premiere',
  'Digital Marketing', 'SEO & Content Writing', 'Nghiên cứu thị trường', 'Business Analysis (BA)', 'Quản lý dự án (Agile/Scrum)',
  'Tiếng Anh (IELTS 7.0+)', 'Tiếng Nhật (N3+)', 'Tiếng Trung (HSK4+)', 'Thuyết trình & Pitching'
];

async function seedData() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/universe_ai';
    console.log('🔄 Đang kết nối MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Đã kết nối MongoDB thành công!');

    // 1. Đảm bảo Roles tồn tại
    console.log('\n--- 1. Kiểm tra Roles ---');
    await Role.findOneAndUpdate({ code: ROLE_CODE.ADMIN }, { name: 'Admin', description: 'Quản trị viên toàn hệ thống' }, { upsert: true });
    await Role.findOneAndUpdate({ code: ROLE_CODE.USER }, { name: 'User', description: 'Sinh viên / Thành viên bình thường' }, { upsert: true });
    console.log('✅ Roles đã sẵn sàng.');

    // 2. Lấy danh sách Ngành (Departments) và Chuyên ngành (Majors)
    console.log('\n--- 2. Lấy dữ liệu Ngành & Chuyên ngành ---');
    const departments = await Department.find({ isActive: true });
    const majors = await Major.find({ isActive: true });
    console.log(`Tìm thấy ${departments.length} ngành và ${majors.length} chuyên ngành trong DB.`);

    const itDept = departments.find(d => d.name.toLowerCase().includes('công nghệ') || d.name.toLowerCase().includes('thông tin')) || departments[0];
    const bizDept = departments.find(d => d.name.toLowerCase().includes('kinh doanh') || d.name.toLowerCase().includes('quản trị')) || departments[1] || departments[0];
    const designDept = departments.find(d => d.name.toLowerCase().includes('thiết kế') || d.name.toLowerCase().includes('mỹ thuật')) || departments[2] || departments[0];
    const langDept = departments.find(d => d.name.toLowerCase().includes('ngôn ngữ')) || departments[3] || departments[0];

    const itMajors = majors.filter(m => m.departmentId?.toString() === itDept._id.toString());
    const bizMajors = majors.filter(m => m.departmentId?.toString() === bizDept._id.toString());
    const designMajors = majors.filter(m => m.departmentId?.toString() === designDept._id.toString());

    // 3. Cập nhật Từ điển Kỹ năng (Skills)
    console.log('\n--- 3. Khởi tạo kho Kỹ năng (Skills) ---');
    for (const skillName of SKILLS_CATALOG) {
      await Skill.findOneAndUpdate(
        { name: skillName },
        { isApproved: true, $inc: { usageCount: 1 } },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Đã đồng bộ ${SKILLS_CATALOG.length} kỹ năng vào từ điển hệ thống.`);

    // 4. Mật khẩu mặc định: 123456
    const salt = await bcrypt.genSalt(10);
    const defaultHashedPassword = await bcrypt.hash('123456', salt);

    // 5. Khởi tạo danh sách Sinh viên mẫu (20 tài khoản sinh viên đa ngành)
    console.log('\n--- 4. Khởi tạo 20 Tài khoản Sinh viên mẫu ---');
    const mockStudentsData = [
      // Nhóm Công nghệ Thông tin
      {
        email: 'hoanglong.se@universe.edu.vn',
        name: 'Lê Hoàng Long',
        gender: 'male',
        dept: itDept,
        major: itMajors[0] || majors[0],
        semester: 7,
        gpa: 3.75,
        package: PACKAGE_TYPE.PREMIUM,
        skills: ['ReactJS', 'Node.js', 'TypeScript', 'Docker / DevOps', 'Next.js'],
        address: 'Cầu Giấy, Hà Nội',
        phone: '0981112233',
        dob: new Date('2003-04-12'),
        rating: 4.9,
        reviewsCount: 8
      },
      {
        email: 'minhtri.ai@universe.edu.vn',
        name: 'Đỗ Minh Trí',
        gender: 'male',
        dept: itDept,
        major: itMajors[1] || majors[1] || majors[0],
        semester: 8,
        gpa: 3.85,
        package: PACKAGE_TYPE.VIP,
        skills: ['Python', 'Trí tuệ nhân tạo (AI)', 'Machine Learning', 'FastAPI', 'Data Analytics'],
        address: 'Thanh Xuân, Hà Nội',
        phone: '0982223344',
        dob: new Date('2002-11-20'),
        rating: 5.0,
        reviewsCount: 12
      },
      {
        email: 'quocbao.fe@universe.edu.vn',
        name: 'Phạm Quốc Bảo',
        gender: 'male',
        dept: itDept,
        major: itMajors[0] || majors[0],
        semester: 6,
        gpa: 3.45,
        package: PACKAGE_TYPE.FREE,
        skills: ['ReactJS', 'Next.js', 'Figma', 'TypeScript'],
        address: 'Bình Thạnh, TP. Hồ Chí Minh',
        phone: '0983334455',
        dob: new Date('2003-08-15'),
        rating: 4.6,
        reviewsCount: 5
      },
      {
        email: 'haidang.dev@universe.edu.vn',
        name: 'Vũ Hải Đăng',
        gender: 'male',
        dept: itDept,
        major: itMajors[0] || majors[0],
        semester: 5,
        gpa: 3.52,
        package: PACKAGE_TYPE.FREE,
        skills: ['Java / Spring Boot', 'MongoDB / MySQL', 'Docker / DevOps'],
        address: 'Nam Từ Liêm, Hà Nội',
        phone: '0984445566',
        dob: new Date('2004-01-28'),
        rating: 4.4,
        reviewsCount: 4
      },
      {
        email: 'tuankiet.mobile@universe.edu.vn',
        name: 'Đặng Tuấn Kiệt',
        gender: 'male',
        dept: itDept,
        major: itMajors[0] || majors[0],
        semester: 7,
        gpa: 3.65,
        package: PACKAGE_TYPE.VIP,
        skills: ['Flutter / Mobile', 'ReactJS', 'Node.js', 'Figma'],
        address: 'Quận 7, TP. Hồ Chí Minh',
        phone: '0985556677',
        dob: new Date('2003-06-03'),
        rating: 4.8,
        reviewsCount: 7
      },

      // Nhóm Kinh tế & Marketing
      {
        email: 'minhtrang.mkt@universe.edu.vn',
        name: 'Trần Minh Trang',
        gender: 'female',
        dept: bizDept,
        major: bizMajors[0] || majors[2] || majors[0],
        semester: 7,
        gpa: 3.82,
        package: PACKAGE_TYPE.PREMIUM,
        skills: ['Digital Marketing', 'SEO & Content Writing', 'Nghiên cứu thị trường', 'Thuyết trình & Pitching'],
        address: 'Đống Đa, Hà Nội',
        phone: '0971112233',
        dob: new Date('2003-09-09'),
        rating: 4.9,
        reviewsCount: 9
      },
      {
        email: 'yennhikdt@universe.edu.vn',
        name: 'Hoàng Yến Nhi',
        gender: 'female',
        dept: bizDept,
        major: bizMajors[1] || majors[2] || majors[0],
        semester: 6,
        gpa: 3.68,
        package: PACKAGE_TYPE.VIP,
        skills: ['Nghiên cứu thị trường', 'Business Analysis (BA)', 'Tiếng Anh (IELTS 7.0+)', 'Quản lý dự án (Agile/Scrum)'],
        address: 'Ba Đình, Hà Nội',
        phone: '0972223344',
        dob: new Date('2003-12-14'),
        rating: 4.7,
        reviewsCount: 6
      },
      {
        email: 'maianh.biz@universe.edu.vn',
        name: 'Bùi Mai Anh',
        gender: 'female',
        dept: bizDept,
        major: bizMajors[0] || majors[2] || majors[0],
        semester: 5,
        gpa: 3.40,
        package: PACKAGE_TYPE.FREE,
        skills: ['Digital Marketing', 'SEO & Content Writing', 'Thuyết trình & Pitching'],
        address: 'Hải Châu, Đà Nẵng',
        phone: '0973334455',
        dob: new Date('2004-03-25'),
        rating: 4.5,
        reviewsCount: 3
      },
      {
        email: 'quanghuy.ba@universe.edu.vn',
        name: 'Ngô Quang Huy',
        gender: 'male',
        dept: bizDept,
        major: bizMajors[1] || majors[2] || majors[0],
        semester: 8,
        gpa: 3.70,
        package: PACKAGE_TYPE.FREE,
        skills: ['Business Analysis (BA)', 'Quản lý dự án (Agile/Scrum)', 'Data Analytics', 'Tiếng Anh (IELTS 7.0+)'],
        address: 'Hoàn Kiếm, Hà Nội',
        phone: '0974445566',
        dob: new Date('2002-07-19'),
        rating: 4.8,
        reviewsCount: 10
      },

      // Nhóm Thiết kế Mỹ thuật số & Truyền thông
      {
        email: 'thaomy.uiux@universe.edu.vn',
        name: 'Võ Thảo My',
        gender: 'female',
        dept: designDept,
        major: designMajors[0] || majors[3] || majors[0],
        semester: 6,
        gpa: 3.78,
        package: PACKAGE_TYPE.PREMIUM,
        skills: ['UI/UX Design', 'Figma', 'Adobe Photoshop', 'Adobe Illustrator'],
        address: 'Quận 1, TP. Hồ Chí Minh',
        phone: '0961112233',
        dob: new Date('2003-10-05'),
        rating: 5.0,
        reviewsCount: 11
      },
      {
        email: 'giahan.media@universe.edu.vn',
        name: 'Lâm Gia Hân',
        gender: 'female',
        dept: designDept,
        major: designMajors[1] || designMajors[0] || majors[0],
        semester: 7,
        gpa: 3.62,
        package: PACKAGE_TYPE.VIP,
        skills: ['Adobe Premiere', 'Adobe Photoshop', 'Digital Marketing', 'UI/UX Design'],
        address: 'Hồng Bàng, Hải Phòng',
        phone: '0962223344',
        dob: new Date('2003-05-18'),
        rating: 4.7,
        reviewsCount: 7
      },
      {
        email: 'quoctuan.design@universe.edu.vn',
        name: 'Phan Quốc Tuấn',
        gender: 'male',
        dept: designDept,
        major: designMajors[0] || majors[3] || majors[0],
        semester: 5,
        gpa: 3.48,
        package: PACKAGE_TYPE.FREE,
        skills: ['Figma', 'UI/UX Design', 'ReactJS'],
        address: 'Hà Đông, Hà Nội',
        phone: '0963334455',
        dob: new Date('2004-02-10'),
        rating: 4.5,
        reviewsCount: 4
      },

      // Nhóm Khối Ngôn ngữ & Đa ngành
      {
        email: 'thuha.eng@universe.edu.vn',
        name: 'Trịnh Thu Hà',
        gender: 'female',
        dept: langDept,
        major: majors.find(m => m.name.toLowerCase().includes('anh')) || majors[0],
        semester: 7,
        gpa: 3.89,
        package: PACKAGE_TYPE.VIP,
        skills: ['Tiếng Anh (IELTS 7.0+)', 'SEO & Content Writing', 'Thuyết trình & Pitching'],
        address: 'Tây Hồ, Hà Nội',
        phone: '0931112233',
        dob: new Date('2003-01-30'),
        rating: 4.9,
        reviewsCount: 8
      },
      {
        email: 'thanhtung.jp@universe.edu.vn',
        name: 'Lý Thanh Tùng',
        gender: 'male',
        dept: langDept,
        major: majors.find(m => m.name.toLowerCase().includes('nhật')) || majors[0],
        semester: 6,
        gpa: 3.55,
        package: PACKAGE_TYPE.FREE,
        skills: ['Tiếng Nhật (N3+)', 'Tiếng Anh (IELTS 7.0+)', 'Business Analysis (BA)'],
        address: 'Thủ Đức, TP. Hồ Chí Minh',
        phone: '0932223344',
        dob: new Date('2003-07-22'),
        rating: 4.6,
        reviewsCount: 5
      },
      {
        email: 'thuylinh.pr@universe.edu.vn',
        name: 'Dương Thùy Linh',
        gender: 'female',
        dept: bizDept,
        major: bizMajors[0] || majors[0],
        semester: 8,
        gpa: 3.73,
        package: PACKAGE_TYPE.VIP,
        skills: ['Digital Marketing', 'Thuyết trình & Pitching', 'SEO & Content Writing'],
        address: 'Cầu Giấy, Hà Nội',
        phone: '0933334455',
        dob: new Date('2002-09-11'),
        rating: 4.8,
        reviewsCount: 9
      }
    ];

    const createdUsers = [];

    // Duyệt và lưu/cập nhật từng tài khoản
    let maleAvatarIdx = 0;
    let femaleAvatarIdx = 0;

    for (const student of mockStudentsData) {
      const avatarPool = student.gender === 'female' ? AVATARS.female : AVATARS.male;
      const avatarUrl = student.gender === 'female'
        ? avatarPool[(femaleAvatarIdx++) % avatarPool.length]
        : avatarPool[(maleAvatarIdx++) % avatarPool.length];

      const userDoc = await User.findOneAndUpdate(
        { email: student.email },
        {
          name: student.name,
          password: defaultHashedPassword,
          roleCode: ROLE_CODE.USER,
          isActive: IS_ACTIVE.ONLINE,
          onboardingCompleted: true,
          avatar: avatarUrl,
          phone: student.phone,
          dob: student.dob,
          address: student.address,
          semester: student.semester,
          departmentId: student.dept?._id,
          majorId: student.major?._id,
          mainSkills: student.skills,
          gpa: student.gpa,
          currentPackage: student.package,
          averageRating: student.rating,
          totalReviewsReceived: student.reviewsCount,
          privacySettings: {
            email: false,
            phone: false,
            dob: true,
            address: true,
            semester: true,
            departmentId: true,
            majorId: true,
            mainSkills: true,
            projectHistory: true,
            gpa: true
          }
        },
        { upsert: true, new: true }
      );

      // Thêm Lịch sử dự án cho sinh viên này (nếu chưa có)
      const existingHistory = await ProjectHistory.findOne({ userId: userDoc._id });
      if (!existingHistory) {
        const hist1 = await ProjectHistory.create({
          userId: userDoc._id,
          type: PROJECT_HISTORY_TYPE.GROUP,
          projectName: `Đồ án môn học kỳ ${Math.max(1, student.semester - 2)}`,
          description: `Tham gia xây dựng sản phẩm mẫu tích hợp giải pháp số, đạt điểm A môn chuyên ngành.`,
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-12-15'),
          role: student.semester >= 7 ? PROJECT_HISTORY_ROLE.LEADER : PROJECT_HISTORY_ROLE.MEMBER,
          task: `Phụ trách các module chính: ${student.skills.slice(0, 2).join(', ')}`
        });

        await User.findByIdAndUpdate(userDoc._id, {
          $addToSet: { projectHistory: hist1._id }
        });
      }

      // Nếu là gói VIP hoặc Premium, tạo Subscription và Transaction giả lập
      if (student.package !== PACKAGE_TYPE.FREE) {
        const price = student.package === PACKAGE_TYPE.VIP ? 59000 : 139000;
        const sub = await Subscription.findOneAndUpdate(
          { userId: userDoc._id, status: SUBSCRIPTION_STATUS.ACTIVE },
          {
            packageType: student.package,
            price: price,
            startDate: new Date(Date.now() - 10 * 86400000),
            endDate: new Date(Date.now() + 20 * 86400000),
            autoRenew: true,
            status: SUBSCRIPTION_STATUS.ACTIVE
          },
          { upsert: true, new: true }
        );

        await Transaction.findOneAndUpdate(
          { userId: userDoc._id, subscriptionId: sub._id },
          {
            amount: price,
            paymentMethod: PAYMENT_METHOD.SEPAY,
            sepayTransactionId: `SEED_TX_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            description: `Thanh toán nâng cấp gói ${student.package.toUpperCase()} (Seed)`,
            status: TRANSACTION_STATUS.SUCCESS
          },
          { upsert: true }
        );
      }

      createdUsers.push(userDoc);
      console.log(`+ Đã tạo/đồng bộ sinh viên: ${student.name} (${student.email}) - Gói: ${student.package.toUpperCase()}`);
    }

    // Lấy thêm user chính hiện tại của bạn nếu có (khiconst4@gmail.com)
    const primaryUser = await User.findOne({ email: 'khiconst4@gmail.com' });
    if (primaryUser) {
      console.log(`\n⭐ Đã tìm thấy tài khoản chính của bạn: ${primaryUser.name} (${primaryUser.email})`);
    }

    // 6. Khởi tạo Danh sách Bài đăng Dự án (20 bài đăng phong phú)
    console.log('\n--- 5. Khởi tạo 20 Bài đăng Dự án phong phú ---');
    const projectsCatalog = [
      {
        title: 'UniFood - Nền tảng đặt & chia sẻ đồ ăn sinh viên quanh ký túc xá',
        description: `Dự án nhằm giải quyết bài toán ăn uống tiết kiệm và tiện lợi cho sinh viên làng đại học. Ứng dụng cho phép sinh viên ghép đơn đặt đồ ăn chung để giảm phí ship, đồng thời kết nối các quán ăn sinh viên giá rẻ quanh khu vực.
Hệ thống bao gồm ứng dụng Mobile cho khách hàng và Web App Dashboard cho chủ quán ăn quản lý đơn hàng theo thời gian thực.`,
        candidateRequirements: `• 01 Bạn Frontend ReactJS/React Native: Có tư duy UI/UX gọn gàng, kết nối API mượt mà.
• 01 Bạn Backend Node.js/Express: Xử lý Socket.io cập nhật trạng thái đơn real-time.
• 01 Bạn Marketing: Lập kế hoạch khảo sát 500 sinh viên và lên bài truyền thông giai đoạn ra mắt.`,
        depts: [itDept._id, bizDept._id],
        targets: [
          { departmentId: itDept._id, neededCount: 2 },
          { departmentId: bizDept._id, neededCount: 1 }
        ],
        gradeTarget: 9.5,
        maxMembers: 4,
        status: PROJECT_STATUS.OPEN,
        daysAhead: 25,
        ownerIdx: 0
      },
      {
        title: 'HealthMate AI - Trợ lý ảo gợi ý dinh dưỡng & lịch tập luyện cá nhân hóa',
        description: `Ứng dụng tích hợp mô hình Gemini AI để phân tích chỉ số cơ thể (BMI, BMR), thói quen ăn uống và mục tiêu thể hình của sinh viên, từ đó tự động lên thực đơn bữa ăn theo ngân sách sinh viên và lịch tập Gym/Calisthenics khoa học.`,
        candidateRequirements: `• 01 Bạn AI / Data Science: Có kinh nghiệm gọi API Gemini / OpenAI, viết Prompt tối ưu và xử lý logic RAG.
• 01 Bạn UI/UX Designer: Thiết kế giao diện Dashboard theo phong cách SaaS tối giản hiện đại (Figma).
• 01 Bạn Mobile App Developer: Thành thạo Flutter hoặc React Native.`,
        depts: [itDept._id, designDept._id],
        targets: [
          { departmentId: itDept._id, neededCount: 2 },
          { departmentId: designDept._id, neededCount: 1 }
        ],
        gradeTarget: 9.0,
        maxMembers: 4,
        status: PROJECT_STATUS.OPEN,
        daysAhead: 30,
        ownerIdx: 1
      },
      {
        title: 'Chiến dịch Rebranding & Digital Marketing cho Thương hiệu Thời trang Gen Z',
        description: `Dự án thực chiến hợp tác với thương hiệu thời trang local brand tái định vị thương hiệu (Rebranding), hướng đến tệp khách hàng Gen Z yêu thích phong cách sống xanh và thời trang bền vững (Eco-friendly).`,
        candidateRequirements: `• 02 Bạn Content & Social Media Marketing: Lên kịch bản TikTok/Reels, viết nội dung truyền cảm hứng.
• 01 Bạn Graphic Designer: Thiết kế Lookbook, bộ banner quảng cáo đa kênh và bao bì sản phẩm.`,
        depts: [bizDept._id, designDept._id],
        targets: [
          { departmentId: bizDept._id, neededCount: 2 },
          { departmentId: designDept._id, neededCount: 1 }
        ],
        gradeTarget: 8.5,
        maxMembers: 4,
        status: PROJECT_STATUS.OPEN,
        daysAhead: 18,
        ownerIdx: 5
      },
      {
        title: 'EduChain - Nền tảng Blockchain lưu trữ và xác thực văn bằng đại học',
        description: `Giải pháp chống giả mạo chứng chỉ và văn bằng tốt nghiệp ứng dụng công nghệ Smart Contract trên mạng thử nghiệm Polygon/Ethereum. Nhà tuyển dụng có thể quét QR Code để xác minh bằng cấp tức thì.`,
        candidateRequirements: `• 01 Bạn Blockchain Developer: Hiểu biết cơ bản về Solidity, Smart Contract, Web3.js.
• 01 Bạn Fullstack Web: ReactJS + ExpressJS để dựng cổng thông tin tra cứu cho doanh nghiệp.`,
        depts: [itDept._id],
        targets: [
          { departmentId: itDept._id, neededCount: 3 }
        ],
        gradeTarget: 9.8,
        maxMembers: 3,
        status: PROJECT_STATUS.OPEN,
        daysAhead: 40,
        ownerIdx: 2
      },
      {
        title: 'Thiết kế Game 3D Giải đố chủ đề Văn hóa Dân gian Việt Nam',
        description: `Dự án game đồ họa 3D phong cách Stylized lấy cảm hứng từ các câu chuyện cổ tích và di tích lịch sử Việt Nam. Game tập trung vào trải nghiệm giải đố môi trường, mang đậm bản sắc văn hóa dân tộc.`,
        candidateRequirements: `• 01 Bạn 3D Artist / Modeler: Sử dụng Blender dựng mô hình nhân vật và môi trường làng quê cổ.
• 01 Bạn Unity/Unreal Engine Developer: Lập trình cơ chế di chuyển, tương tác vật thể và camera.`,
        depts: [designDept._id, itDept._id],
        targets: [
          { departmentId: designDept._id, neededCount: 2 },
          { departmentId: itDept._id, neededCount: 1 }
        ],
        gradeTarget: 9.0,
        maxMembers: 3,
        status: PROJECT_STATUS.OPEN,
        daysAhead: 21,
        ownerIdx: 9
      },
      {
        title: 'Nghiên cứu Thị trường & Giải pháp Xúc tiến Du lịch Chữa lành (Healing Tourism)',
        description: `Khảo sát chuyên sâu nhu cầu du lịch nghỉ dưỡng kết hợp chữa lành tâm hồn của người trẻ văn phòng và sinh viên sau giai đoạn căng thẳng. Đề xuất mô hình kinh doanh homestay kết hợp workshop thiền trà và nghệ thuật.`,
        candidateRequirements: `• 01 Bạn Du lịch / Quản trị: Thiết kế tour trải nghiệm 3 ngày 2 đêm tại Đà Lạt / Măng Đen.
• 01 Bạn Marketing: Khảo sát định lượng và phân tích dữ liệu SPSS.`,
        depts: [bizDept._id, langDept._id],
        targets: [
          { departmentId: bizDept._id, neededCount: 2 },
          { departmentId: langDept._id, neededCount: 1 }
        ],
        gradeTarget: 8.8,
        maxMembers: 3,
        status: PROJECT_STATUS.OPEN,
        daysAhead: 15,
        ownerIdx: 6
      },
      {
        title: 'Hệ thống AI Dịch thuật Ngôn ngữ Ký hiệu thời gian thực hỗ trợ người khiếm thính',
        description: `Dự án Capstone nghiên cứu ứng dụng Computer Vision và MediaPipe để nhận diện cử chỉ bàn tay từ webcam máy tính, chuyển đổi thành phụ đề tiếng Việt và giọng nói tự động giúp người khiếm thính hòa nhập cộng đồng.`,
        candidateRequirements: `• 01 Bạn AI / Computer Vision: Tiền xử lý dữ liệu video và huấn luyện mô hình LSTM / CNN.
• 01 Bạn Frontend React: Dựng giao diện lớp học trực tuyến tích hợp webcam và khung chat phụ đề.`,
        depts: [itDept._id],
        targets: [
          { departmentId: itDept._id, neededCount: 2 }
        ],
        gradeTarget: 10.0,
        maxMembers: 4,
        status: PROJECT_STATUS.IN_PROGRESS,
        daysAhead: 45,
        ownerIdx: 1
      },
      {
        title: 'FinEd - Ứng dụng Game hóa Quản lý Tài chính cá nhân cho Tân sinh viên',
        description: `Biến việc ghi chép chi tiêu buồn tẻ thành trò chơi nuôi thú cưng ảo (Virtual Pet). Sinh viên tiết kiệm được tiền hoặc ghi chép đều đặn sẽ giúp thú cưng lên cấp, nhận voucher ăn uống và tích lũy kiến thức tài chính.`,
        candidateRequirements: `• 01 Bạn UI/UX Game Design: Vẽ asset thú cưng 2D dễ thương, thiết kế luồng Gamification.
• 01 Bạn Frontend Developer: Tích hợp Chart.js hiển thị biểu đồ ngân sách trực quan.`,
        depts: [itDept._id, bizDept._id, designDept._id],
        targets: [
          { departmentId: itDept._id, neededCount: 1 },
          { departmentId: bizDept._id, neededCount: 1 },
          { departmentId: designDept._id, neededCount: 1 }
        ],
        gradeTarget: 9.2,
        maxMembers: 4,
        status: PROJECT_STATUS.OPEN,
        daysAhead: 28,
        ownerIdx: 7
      },
      {
        title: 'Nền tảng Kết nối Gia sư Sinh viên Dạy kèm Ngoại ngữ & Tin học',
        description: `Cổng kết nối uy tín giữa sinh viên giỏi có nhu cầu làm thêm với phụ huynh và học sinh. Tích hợp tính năng xác thực thẻ sinh viên và đánh giá độ uy tín qua điểm rèn luyện và chứng chỉ ngoại ngữ.`,
        candidateRequirements: `• 01 Bạn Backend Developer: Thiết kế cơ sở dữ liệu MongoDB và API phân quyền rõ ràng.
• 01 Bạn Content Marketing: Xây dựng cộng đồng 5.000 phụ huynh học sinh trên Facebook.`,
        depts: [itDept._id, langDept._id],
        targets: [
          { departmentId: itDept._id, neededCount: 1 },
          { departmentId: langDept._id, neededCount: 1 }
        ],
        gradeTarget: 8.5,
        maxMembers: 3,
        status: PROJECT_STATUS.OPEN,
        daysAhead: 20,
        ownerIdx: 12
      },
      {
        title: 'SmartFarm IoT - Giám sát và Điều khiển Tưới tiêu Nông nghiệp thông minh',
        description: `Dự án nghiên cứu chế tạo bo mạch ESP32 kết nối cảm biến độ ẩm đất, nhiệt độ môi trường và điều khiển van tưới tự động qua Internet. Dữ liệu được đẩy lên Cloud và hiển thị trên Web Dashboard.`,
        candidateRequirements: `• 01 Bạn Phần cứng / IoT: Lập trình C/C++ trên Arduino/ESP32, kết nối giao thức MQTT.
• 01 Bạn Web Frontend: Thiết kế bảng điều khiển trực quan với React và WebSocket.`,
        depts: [itDept._id],
        targets: [
          { departmentId: itDept._id, neededCount: 2 }
        ],
        gradeTarget: 9.0,
        maxMembers: 3,
        status: PROJECT_STATUS.OPEN,
        daysAhead: 35,
        ownerIdx: 3
      },
      {
        title: 'Ứng dụng Carpooling - Đi chung xe tiết kiệm chi phí cho Sinh viên Làng Đại học',
        description: `Giải pháp giúp sinh viên có xe máy chia sẻ chuyến đi với bạn học cùng tuyến đường từ Ký túc xá đến các giảng đường, vừa tiết kiệm tiền xăng, vừa giảm thiểu ùn tắc và bảo vệ môi trường.`,
        candidateRequirements: `• 01 Bạn Mobile Developer: Tích hợp bản đồ Google Maps API, thuật toán tính quãng đường tối ưu.
• 01 Bạn Marketing: Lên chiến dịch phát tờ rơi và viral clip tại các cổng trường đại học.`,
        depts: [itDept._id, bizDept._id],
        targets: [
          { departmentId: itDept._id, neededCount: 1 },
          { departmentId: bizDept._id, neededCount: 1 }
        ],
        gradeTarget: 8.7,
        maxMembers: 3,
        status: PROJECT_STATUS.OPEN,
        daysAhead: 22,
        ownerIdx: 4
      },
      {
        title: 'Bộ Nhận diện Thương hiệu & Website Thương mại Điện tử Nông sản OCOP',
        description: `Dự án hoàn thành môn học: Xây dựng bộ nhận diện chuyên nghiệp gồm Logo, Bao bì, Nhãn mác và Website bán hàng cho hợp tác xã sản xuất trà thảo mộc vùng cao đạt chuẩn OCOP 4 sao.`,
        candidateRequirements: `Dự án đã đủ thành viên và hoàn thành xuất sắc bảo vệ trước hội đồng giảng viên.`,
        depts: [designDept._id, bizDept._id],
        targets: [
          { departmentId: designDept._id, neededCount: 2 },
          { departmentId: bizDept._id, neededCount: 1 }
        ],
        gradeTarget: 9.5,
        maxMembers: 3,
        status: PROJECT_STATUS.COMPLETED,
        daysAhead: -10,
        ownerIdx: 9
      }
    ];

    // Tạo các dự án do tài khoản của bạn (Nguyễn Bảo An) chủ trì để bạn có ngay dự án trong trang /manage
    if (primaryUser) {
      projectsCatalog.unshift({
        title: 'UniVerse AI - Nền tảng Ghép nhóm Dự án & Tuyển dụng Sinh viên Thông minh',
        description: `Dự án Startup công nghệ giải quyết bài toán tìm đồng đội làm đồ án và bài tập lớn cho sinh viên đại học. Ứng dụng tích hợp AI Matching phân tích độ tương thích giữa CV ứng viên và bài đăng tuyển dụng.`,
        candidateRequirements: `• 01 Bạn Backend NodeJS: Viết API sạch chuẩn Clean Architecture.
• 01 Bạn UI/UX Designer: Hoàn thiện design system SaaS Enterprise chuyên nghiệp.
• 01 Bạn Marketing Lead: Triển khai chiến dịch truyền thông ra mắt toàn trường.`,
        depts: [itDept._id, bizDept._id, designDept._id],
        targets: [
          { departmentId: itDept._id, neededCount: 1 },
          { departmentId: bizDept._id, neededCount: 1 },
          { departmentId: designDept._id, neededCount: 1 }
        ],
        gradeTarget: 10.0,
        maxMembers: 4,
        status: PROJECT_STATUS.OPEN,
        daysAhead: 30,
        isPrimaryOwner: true
      });

      projectsCatalog.push({
        title: 'Dự án Nghiên cứu Xây dựng Chatbot Tuyển sinh với Công nghệ RAG',
        description: `Dự án ứng dụng mô hình ngôn ngữ lớn (LLM) và kỹ thuật RAG trên kho dữ liệu đề án tuyển sinh, giúp tân sinh viên và phụ huynh giải đáp thắc mắc 24/7 với độ chính xác cao.`,
        candidateRequirements: `• Cần 01 bạn am hiểu Python và thư viện LangChain / LlamaIndex.`,
        depts: [itDept._id],
        targets: [{ departmentId: itDept._id, neededCount: 2 }],
        gradeTarget: 9.0,
        maxMembers: 3,
        status: PROJECT_STATUS.IN_PROGRESS,
        daysAhead: 45,
        isPrimaryOwner: true
      });
    }

    const createdProjects = [];

    for (let i = 0; i < projectsCatalog.length; i++) {
      const p = projectsCatalog[i];
      const owner = p.isPrimaryOwner ? primaryUser : createdUsers[p.ownerIdx % createdUsers.length];

      // Ngày hết hạn
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + p.daysAhead);

      // Thành viên mẫu nếu là dự án IN_PROGRESS hoặc COMPLETED
      const sampleMembers = [];
      if (p.status === PROJECT_STATUS.IN_PROGRESS || p.status === PROJECT_STATUS.COMPLETED) {
        const potentialMembers = createdUsers.filter(u => u._id.toString() !== owner._id.toString());
        const m1 = potentialMembers[i % potentialMembers.length];
        const m2 = potentialMembers[(i + 1) % potentialMembers.length];
        if (m1) sampleMembers.push({ userId: m1._id, role: 'Frontend Developer', joinedAt: new Date(Date.now() - 15 * 86400000) });
        if (m2) sampleMembers.push({ userId: m2._id, role: 'UI/UX Designer', joinedAt: new Date(Date.now() - 10 * 86400000) });
      }

      const projectDoc = await Project.findOneAndUpdate(
        { title: p.title },
        {
          ownerId: owner._id,
          description: p.description,
          candidateRequirements: p.candidateRequirements,
          departmentIds: p.depts,
          departmentTargets: p.targets,
          gradeTarget: p.gradeTarget,
          maxMembers: p.maxMembers,
          deadline: deadlineDate,
          status: p.status,
          members: sampleMembers,
          completedAt: p.status === PROJECT_STATUS.COMPLETED ? new Date(Date.now() - 5 * 86400000) : null
        },
        { upsert: true, new: true }
      );

      createdProjects.push(projectDoc);
      console.log(`+ Dự án: "${p.title}" - Trạng thái: [${p.status.toUpperCase()}] - Chủ trì: ${owner.name}`);
    }

    // 7. Tạo Đơn ứng tuyển mẫu (Applications) kèm phân tích AI
    console.log('\n--- 6. Khởi tạo Đơn ứng tuyển & Đánh giá phù hợp từ AI ---');
    let applicationCount = 0;

    for (const project of createdProjects) {
      if (project.status === PROJECT_STATUS.OPEN) {
        // Lấy 2 ứng viên ngẫu nhiên không phải chủ dự án
        const potentialApplicants = createdUsers.filter(u => u._id.toString() !== project.ownerId.toString());
        const app1User = potentialApplicants[applicationCount % potentialApplicants.length];
        const app2User = potentialApplicants[(applicationCount + 1) % potentialApplicants.length];

        const mockApps = [
          {
            user: app1User,
            matchPercent: Math.floor(Math.random() * 15) + 80, // 80 - 95%
            note: 'Em đã đọc kỹ yêu cầu bài toán và rất mong muốn được thử sức cùng team. Em có thể làm việc full-time vào cuối tuần.',
            status: APPLICATION_STATUS.PENDING
          },
          {
            user: app2User,
            matchPercent: Math.floor(Math.random() * 20) + 70, // 70 - 90%
            note: 'Em có kinh nghiệm tham gia 2 đồ án tương tự kỳ trước, rất hy vọng được trao đổi thêm với nhóm qua buổi phỏng vấn online.',
            status: APPLICATION_STATUS.PENDING
          }
        ];

        for (const app of mockApps) {
          if (!app.user) continue;

          await Application.findOneAndUpdate(
            { projectId: project._id, applicantId: app.user._id },
            {
              cvFileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              note: app.note,
              matchPercent: app.matchPercent,
              matchReason: `Ứng viên ${app.user.name} có kỹ năng phù hợp ${app.matchPercent}% với yêu cầu tuyển dụng. Đã hoàn thành các môn học chuyên ngành với GPA ${app.user.gpa}/4.0.`,
              matchDetails: {
                strengths: [
                  `Thành thạo kỹ năng chuyên môn: ${app.user.mainSkills.slice(0, 3).join(', ')}`,
                  `Điểm GPA xuất sắc: ${app.user.gpa}/4.0`,
                  `Tích cực hoạt động, đánh giá cộng đồng cao (${app.user.averageRating} sao)`
                ],
                weaknesses: [
                  'Cần trao đổi thêm về lịch trình chi tiết và cam kết thời gian hoàn thành task'
                ],
                recommendation: app.matchPercent >= 85
                  ? 'Ứng viên rất tiềm năng, khuyên bạn nên chấp nhận hoặc hẹn phỏng vấn ngay!'
                  : 'Ứng viên có kỹ năng nền tảng khá, nên trao đổi thêm về kinh nghiệm thực chiến.'
              },
              status: app.status
            },
            { upsert: true }
          );
          applicationCount++;
        }
      }
    }
    console.log(`✅ Đã tạo/đồng bộ ${applicationCount} hồ sơ ứng tuyển kèm phân tích AI thông minh.`);

    // 8. Tạo Đánh giá Review cho các dự án đã hoàn thành
    console.log('\n--- 7. Khởi tạo Đánh giá (Review) cho dự án đã hoàn thành ---');
    const completedProjects = createdProjects.filter(p => p.status === PROJECT_STATUS.COMPLETED);
    let reviewCount = 0;

    for (const proj of completedProjects) {
      if (proj.members && proj.members.length > 0) {
        for (const m of proj.members) {
          // Review từ chủ dự án cho thành viên
          await Review.findOneAndUpdate(
            { projectId: proj._id, reviewerId: proj.ownerId, revieweeId: m.userId },
            {
              rating: 5,
              isAutoRated: false
            },
            { upsert: true }
          );
          // Review từ thành viên cho chủ dự án
          await Review.findOneAndUpdate(
            { projectId: proj._id, reviewerId: m.userId, revieweeId: proj.ownerId },
            {
              rating: 5,
              isAutoRated: false
            },
            { upsert: true }
          );
          reviewCount += 2;
        }
      }
    }
    console.log(`✅ Đã tạo ${reviewCount} đánh giá review mẫu cho dự án hoàn thành.`);

    console.log('\n======================================================');
    console.log('🎉 SEED DỮ LIỆU THÀNH CÔNG RỰC RỠ!');
    console.log('------------------------------------------------------');
    console.log(`• Tài khoản sinh viên mẫu: ${createdUsers.length} tài khoản`);
    console.log(`• Mật khẩu chung cho mọi tài khoản sinh viên: 123456`);
    console.log(`• Dự án mẫu tuyển dụng: ${createdProjects.length} bài đăng`);
    console.log(`• Hồ sơ ứng tuyển AI: ${applicationCount} đơn`);
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
}

seedData();

---
trigger: always_on
---

- Ứng dụng chia thành 2 phần riêng: 
              1. frontend** (`frontend/`, React) và 2. backend** (`backend/`, Node.js + Express).  
- Kiến trúc backend tuân thủ pattern :
Controller → Service → Repository**. Business logic nằm trong Service, Controller chỉ điều phối request/response.  
- **Không truy vấn database trực tiếp trong Controller**; mọi truy cập DB phải qua lớp Repository hoặc Model.  
- Sử dụng cơ sở dữ liệu MySQL. Tất cả thay đổi về schema DB phải cập nhật vào `@/database_design.md`.  
- Tên file/module/sử dụng thư viện tuân theo quy ước chung của dự án.
- Không sửa đổi cấu trúc thư mục hiện có (không di chuyển file giữa `frontend/` và `backend/`). Trước khi thêm file, kiểm tra nghiệp vụ kiến trúc  hiện tại.  

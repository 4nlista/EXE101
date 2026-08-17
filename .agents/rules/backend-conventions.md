---
trigger: always_on
---

- Code backend dùng **async/await** (tránh callback). Sử dụng ES Modules (`import`) nếu dự án đã cấu hình `type: module` trong `package.json`.  
- Error handling: Luôn sử dụng error middleware của Express cho lỗi (ví dụ `next(err)`), không trả lỗi thô. Trả JSON lỗi với mã HTTP thích hợp (e.g., 4xx/5xx).  

- Mọi logic nghiệp vụ phải nằm trong tầng **Service**. Controller chỉ gọi Service và trả response. 

- Rõ ràng các ràng buộc validate và nên tái sử dụng một cách hợp lý thay vì viết bừa.

- Sử dụng patterns đã định (ví dụ: tên hàm camelCase, class hoặc object reuse), tuân theo tiểu chuẩn conventions của toàn cầu.  

- Truy cập database qua **Repository** hoặc models (theo `@/database_design.md`). Không `require` trực tiếp truy vấn trong Controller hoặc Service.  

- Trước khi nếu phải thêm package npm mới, kiểm tra file `package.json` và không dùng thư viện thừa nếu đã có sẵn.  

- Đảm bảo log có ý nghĩa (sử dụng console/log libraries) và không lộ thông tin nhạy cảm (không log mật khẩu).  

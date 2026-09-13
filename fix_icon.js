const fs = require('fs');
const file = 'frontend/src/pages/profile/ProfileOnboarding.jsx';
let content = fs.readFileSync(file, 'utf8');

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="me-1 mb-1" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/></svg>`;

content = content.replace(/<Form\.Control\.Feedback type="invalid">\{([^\}]+)\}<\/Form\.Control\.Feedback>/g, `<Form.Control.Feedback type="invalid">\n          ${svgIcon} {$1}\n        </Form.Control.Feedback>`);

// Xử lý riêng cho case custom div báo lỗi
content = content.replace(/<div className="text-danger small mt-1">\{([^\}]+)\}<\/div>/g, `<div className="text-danger small mt-1">\n          ${svgIcon} {$1}\n        </div>`);
content = content.replace(/<small className="text-danger mt-1 d-block">\{([^\}]+)\}<\/small>/g, `<small className="text-danger mt-1 d-block">\n          ${svgIcon} {$1}\n        </small>`);

fs.writeFileSync(file, content);
console.log('Done!');

import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { FileText, TrendingUp, CheckCircle2, BarChart2 } from 'lucide-react';

/**
 * Xóa sạch mọi emoji và biểu tượng màu mè khỏi văn bản
 */
const cleanText = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/###/g, '')
    .trim();
};

/**
 * Hiển thị văn bản mượt mà, hỗ trợ in đậm cho cú pháp **chữ**
 */
const FormattedInlineText = ({ text }) => {
  if (!text) return null;
  const cleaned = cleanText(text);

  // Phân tách chuỗi theo các khối in đậm **nội dung**
  const parts = cleaned.split(/(\*\*[^*]+\*\*)/g);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className="fw-semibold text-dark">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

/**
 * Component hiển thị báo cáo phản hồi từ AI Admin dưới dạng Form / Bảng / Thẻ chỉ số chuẩn UX
 */
export default function AiStructuredReport({ data }) {
  // 1. Trường hợp data là chuỗi (string)
  let report = data;
  if (typeof data === 'string') {
    try {
      report = JSON.parse(data);
    } catch {
      // Nếu là string thuần hoặc văn bản markdown cũ, parse thành cấu trúc chuẩn
      const lines = data.split('\n').map(l => l.trim()).filter(Boolean);
      let title = 'Báo cáo thống kê';
      let summary = '';
      const bullets = [];

      lines.forEach((line) => {
        if (line.startsWith('###') || line.startsWith('##')) {
          title = cleanText(line);
        } else if (line.startsWith('*') || line.startsWith('-')) {
          bullets.push(cleanText(line.replace(/^[*-\s]+/, '')));
        } else if (!summary) {
          summary = cleanText(line);
        }
      });

      return (
        <div className="d-flex flex-column gap-2 text-dark" style={{ fontSize: '0.88rem' }}>
          {title && (
            <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-bold text-dark">
              <FileText size={16} className="text-secondary" />
              <span>{title}</span>
            </div>
          )}
          {summary && (
            <p className="mb-2 text-secondary" style={{ lineHeight: '1.6' }}>
              <FormattedInlineText text={summary} />
            </p>
          )}
          {bullets.length > 0 && (
            <ul className="mb-0 ps-3 text-secondary d-flex flex-column gap-1">
              {bullets.map((b, idx) => (
                <li key={idx}>
                  <FormattedInlineText text={b} />
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
  }

  if (!report || typeof report !== 'object') {
    return <span className="text-dark small">Không có dữ liệu phản hồi.</span>;
  }

  const { title, summary, metrics, table, insights, recommendations } = report;

  return (
    <div className="d-flex flex-column gap-3 text-dark" style={{ fontSize: '0.88rem' }}>
      {/* ── Tiêu đề báo cáo ── */}
      {title && (
        <div className="d-flex align-items-center justify-content-between pb-2 border-bottom">
          <div className="d-flex align-items-center gap-2 fw-bold text-dark">
            <FileText size={16} className="text-secondary" />
            <span>{cleanText(title)}</span>
          </div>
          <span className="badge bg-light text-secondary border fw-normal" style={{ fontSize: '0.7rem' }}>
            Báo cáo hệ thống
          </span>
        </div>
      )}

      {/* ── Tóm tắt phân tích ── */}
      {summary && (
        <div className="text-secondary" style={{ lineHeight: '1.65' }}>
          <FormattedInlineText text={summary} />
        </div>
      )}

      {/* ── Lưới thẻ chỉ số (Metrics Cards) ── */}
      {Array.isArray(metrics) && metrics.length > 0 && (
        <div>
          <div className="d-flex align-items-center gap-2 mb-2 text-secondary small fw-medium">
            <BarChart2 size={15} />
            <span>Các chỉ số trọng tâm</span>
          </div>
          <Row className="g-2">
            {metrics.map((m, idx) => (
              <Col xs={12} sm={6} md={metrics.length <= 2 ? 6 : 4} key={idx}>
                <div className="bg-light border rounded-3 p-3 text-center h-100 d-flex flex-column justify-content-center">
                  <div className="text-secondary small fw-medium mb-1">
                    {cleanText(m.label)}
                  </div>
                  <div className="fs-4 fw-bold text-dark my-1">
                    {cleanText(m.value)}
                  </div>
                  {m.badge && (
                    <div className="mt-1">
                      <span className="badge bg-white text-secondary border fw-normal small">
                        {cleanText(m.badge)}
                      </span>
                    </div>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* ── Bảng dữ liệu thống kê chi tiết (Data Table) ── */}
      {table && Array.isArray(table.headers) && Array.isArray(table.rows) && table.rows.length > 0 && (
        <div className="border rounded-3 overflow-hidden bg-white shadow-none mt-1">
          {table.title && (
            <div className="bg-light px-3 py-2 border-bottom text-dark fw-semibold small">
              {cleanText(table.title)}
            </div>
          )}
          <div className="table-responsive mb-0">
            <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
              <thead className="table-light border-bottom">
                <tr>
                  {table.headers.map((h, i) => (
                    <th key={i} className="py-2 px-3 text-secondary fw-semibold">
                      {cleanText(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {Array.isArray(row) && row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2 px-3 text-dark">
                        <FormattedInlineText text={String(cell)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Khối Nhận định (Insights Box) ── */}
      {insights && (
        <div className="p-3 rounded-3 border bg-light">
          <div className="d-flex align-items-center gap-2 mb-1">
            <TrendingUp size={15} className="text-secondary" />
            <span className="fw-semibold text-dark small">Nhận định chuyên môn</span>
          </div>
          <div className="text-secondary small" style={{ lineHeight: '1.6' }}>
            <FormattedInlineText text={insights} />
          </div>
        </div>
      )}

      {/* ── Khối Đề xuất / Lời khuyên vận hành (Recommendations Box) ── */}
      {recommendations && (
        <div className="p-3 rounded-3 border bg-white">
          <div className="d-flex align-items-center gap-2 mb-1">
            <CheckCircle2 size={15} className="text-secondary" />
            <span className="fw-semibold text-dark small">Khuyến nghị vận hành</span>
          </div>
          <div className="text-secondary small" style={{ lineHeight: '1.6' }}>
            <FormattedInlineText text={recommendations} />
          </div>
        </div>
      )}
    </div>
  );
}

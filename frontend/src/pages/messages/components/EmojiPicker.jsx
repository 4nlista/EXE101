import React, { useState } from 'react';
import Button from '../../../components/Button';
import { EMOJI_CATEGORIES } from '../utils/messageHelpers';

// Bảng chọn biểu tượng cảm xúc phân nhóm có tabs chuyển đổi
export default function EmojiPicker({ pickerRef, onSelectEmoji }) {
  const [activeTab, setActiveTab] = useState('smileys');

  const currentCategory = EMOJI_CATEGORIES.find(c => c.id === activeTab);

  return (
    <div ref={pickerRef} className="messages-emoji-popover">
      {/* Thanh tab các nhóm emoji */}
      <div className="messages-emoji-tabs">
        {EMOJI_CATEGORIES.map(cat => (
          <Button
            key={cat.id}
            type="button"
            className={`messages-emoji-tab-btn ${activeTab === cat.id ? 'active' : ''}`}
            onClick={() => setActiveTab(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Lưới hiển thị các emoji */}
      <div className="messages-emoji-grid">
        {currentCategory?.emojis.map((emoji, idx) => (
          <Button
            key={idx}
            type="button"
            className="messages-emoji-item"
            onClick={() => onSelectEmoji(emoji)}
            title={emoji}
          >
            {emoji}
          </Button>
        ))}
      </div>
    </div>
  );
}

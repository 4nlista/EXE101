import React from 'react';
import { Smile, Send } from 'lucide-react';
import Button from '../../../components/Button';
import EmojiPicker from './EmojiPicker';

// Khung soạn thảo tin nhắn gồm nút emoji, ô nhập văn bản và nút gửi
export default function MessageComposer({
  messageInput,
  setMessageInput,
  onSendMessage,
  showEmojiPicker,
  onToggleEmoji,
  emojiPickerRef,
  emojiButtonRef,
  inputRef,
  onSelectEmoji
}) {
  return (
    <div className="messages-composer-container">
      {/* Bảng chọn Emoji cảm xúc */}
      {showEmojiPicker && (
        <EmojiPicker
          pickerRef={emojiPickerRef}
          onSelectEmoji={onSelectEmoji}
        />
      )}

      <form onSubmit={onSendMessage}>
        <div className="messages-composer-pill">
          {/* Nút bật/tắt bảng chọn emoji */}
          <Button
            ref={emojiButtonRef}
            type="button"
            className="messages-emoji-btn"
            onClick={onToggleEmoji}
            title="Chọn biểu tượng cảm xúc"
          >
            <Smile size={20} />
          </Button>

          {/* Ô nhập tin nhắn */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Nhập tin nhắn..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="messages-composer-input"
            autoComplete="off"
          />

          {/* Nút gửi tin nhắn tròn với icon chiếc máy bay giấy */}
          <Button
            type="submit"
            disabled={!messageInput.trim()}
            className="messages-send-btn"
            title="Gửi tin nhắn"
          >
            <Send size={20} className="messages-send-icon" />
          </Button>
        </div>
      </form>
    </div>
  );
}

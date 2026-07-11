import ChatMessage from "./ChatMessage";

export default function ChatWindow({ messages, chatEndRef }) {
  return (
    <div
      className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      tabIndex={0} // allows keyboard users to focus and scroll
    >
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      <div ref={chatEndRef} />
    </div>
  );
}

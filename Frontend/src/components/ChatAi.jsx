import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send } from "lucide-react";

function ChatAi({ problem }) {
  const [messages, setMessages] = useState([
    { role: "model", parts: [{ text: "Hi, How can I help you?" }] },
  ]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const onSubmit = async (data) => {
    const updatedMessages = [
      ...messages,
      { role: "user", parts: [{ text: data.message }] },
    ];
    setMessages(updatedMessages);
    reset();

    try {
      const conversationForApi = updatedMessages
        .filter((msg) => msg?.parts?.[0]?.text)
        .map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.parts[0].text }],
        }));

      while (
        conversationForApi.length &&
        conversationForApi[0].role !== "user"
      ) {
        conversationForApi.shift();
      }

      const response = await axiosClient.post("/ai/chat", {
        userMessage: conversationForApi,
        problem: problem,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [{ text: response.data.reply }],
        },
      ]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [{ text: "Sorry, I encountered an error" }],
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-[80vh] min-h-125">
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-bubble bg-base-200 text-base-content">
              {msg.parts[0].text}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="sticky bottom-0 p-4 bg-base-100 border-t"
      >
        <div className="flex items-center">
          <input
            placeholder="Ask me anything"
            className="input input-bordered flex-1"
            {...register("message", { required: true, minLength: 2 })}
          />
          <button
            type="submit"
            className="btn btn-ghost ml-2"
            disabled={errors.message}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatAi;

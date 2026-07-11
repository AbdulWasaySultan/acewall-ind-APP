// Transform database messages to UI format
export const normalizeMessagesFromDB = (dbChats) => {
  const normalized = []

  dbChats.forEach((chat) => {
    // Add user message
    if (chat.question) {
      normalized.push({
        id: chat._id + "_question",
        text: chat.question.text,
        sender: "user",
        timestamp: chat.createdAt,
        dbId: chat._id,
        generatedFile: chat.generatedFile,
        file: chat.file,
        fileUsed: chat.fileUsed
      })
    }

    // Add AI response
    if (chat.answer) {
      normalized.push({
        id: chat._id + "_answer",
        text: chat.answer.text,
        sender: "ai",
        timestamp: chat.createdAt,
        dbId: chat._id,
        generatedFile: chat.generatedFile,
        file: chat.file,
        fileUsed: chat.fileUsed
      })
    }
  })

  return normalized
}

// Format UI message to database format when saving
export const formatMessageForDB = (userQuestion, aiAnswer) => {
  return {
    question: {
      text: userQuestion,
      sender: "user",
    },
    answer: {
      text: aiAnswer,
      sender: "ai",
    },
  }
}

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const prisma = require("../config/prisma");
const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const axios = require("axios");
const mime = require("mime-types");

const getGenAI = () => {
  return process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
};

const getFileManager = () => {
  return process.env.GEMINI_API_KEY ? new GoogleAIFileManager(process.env.GEMINI_API_KEY) : null;
};

const getFileBuffer = async (fileUrl) => {
  if (fileUrl.startsWith("http")) {
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } else {
    const filePath = path.join(process.cwd(), fileUrl);
    return fs.readFileSync(filePath);
  }
};

const extractText = async (file) => {
  const buffer = await getFileBuffer(file.fileUrl);
  const ext = file.name.split('.').pop().toLowerCase();
  
  if (ext === 'pdf') {
    const data = await pdf(buffer);
    return data.text;
  } else if (ext === 'docx' || ext === 'doc') {
    const data = await mammoth.extractRawText({ buffer });
    return data.value;
  } else if (['txt', 'md', 'csv', 'json', 'js', 'jsx', 'html', 'css'].includes(ext)) {
    return buffer.toString('utf-8');
  } else {
    throw new Error("Unsupported file type for text extraction.");
  }
};

const getMediaParts = async (file) => {
  const ext = file.name.split('.').pop().toLowerCase();
  
  // Handle Images (Inline Data)
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
    const buffer = await getFileBuffer(file.fileUrl);
    const mimeType = mime.lookup(file.name) || 'image/jpeg';
    return [{
      inlineData: {
        data: buffer.toString("base64"),
        mimeType
      }
    }];
  }
  
  // Handle Videos (File API)
  if (['mp4', 'webm', 'mov', 'ogg'].includes(ext)) {
    const fileManager = getFileManager();
    if (!fileManager) throw new Error("File Manager initialization failed.");
    
    let filePathToUpload = file.fileUrl;
    let tempPath = null;
    
    // If it's a remote URL, download it temporarily
    if (file.fileUrl.startsWith("http")) {
      const buffer = await getFileBuffer(file.fileUrl);
      tempPath = path.join(__dirname, `temp_${Date.now()}.${ext}`);
      fs.writeFileSync(tempPath, buffer);
      filePathToUpload = tempPath;
    } else {
      filePathToUpload = path.join(process.cwd(), file.fileUrl);
    }
    
    const mimeType = mime.lookup(file.name) || 'video/mp4';
    
    console.log(`Uploading ${file.name} to Gemini...`);
    const uploadResult = await fileManager.uploadFile(filePathToUpload, {
      mimeType,
      displayName: file.name,
    });
    
    let geminiFile = await fileManager.getFile(uploadResult.file.name);
    console.log(`Processing video... state: ${geminiFile.state}`);
    
    while (geminiFile.state === 'PROCESSING') {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      geminiFile = await fileManager.getFile(uploadResult.file.name);
      console.log(`Still processing... state: ${geminiFile.state}`);
    }
    
    if (geminiFile.state === 'FAILED') {
      throw new Error("Video processing failed on Gemini's servers.");
    }
    
    // Cleanup temp file if downloaded
    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    
    return [{
      fileData: {
        fileUri: uploadResult.file.uri,
        mimeType
      }
    }];
  }
  
  // Handle Text/Documents
  const text = await extractText(file);
  return [{ text: `Here is the document content:\n\n${text.substring(0, 30000)}` }];
};

const summarizeDocument = async (req, res) => {
  try {
    const genAI = getGenAI();
    if (!genAI) return res.status(500).json({ success: false, message: "Gemini API Key missing." });

    const file = await prisma.file.findUnique({ where: { id: Number(req.params.fileId) } });
    if (!file) return res.status(404).json({ success: false, message: "File not found." });

    const parts = await getMediaParts(file);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    const prompt = "Summarize this file in a concise, professional manner. Highlight the key points. If it is an image or video, describe what happens or what is shown.";
    const result = await model.generateContent([prompt, ...parts]);
    const summary = result.response.text();

    await prisma.file.update({
      where: { id: file.id },
      data: { summary }
    });

    res.status(200).json({ success: true, summary });
  } catch (error) {
    console.error("AI Summarize Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const extractKeywords = async (req, res) => {
  try {
    const genAI = getGenAI();
    if (!genAI) return res.status(500).json({ success: false, message: "Gemini API Key missing." });

    const file = await prisma.file.findUnique({ where: { id: Number(req.params.fileId) } });
    if (!file) return res.status(404).json({ success: false, message: "File not found." });

    const parts = await getMediaParts(file);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    const prompt = "Extract exactly 5-10 comma-separated keywords or short key phrases from this file. Do not include any other text or explanation, just the comma-separated words.";
    const result = await model.generateContent([prompt, ...parts]);
    
    const keywordsRaw = result.response.text();
    const keywordsArray = keywordsRaw.split(',').map(k => k.trim()).filter(k => k.length > 0);

    await prisma.file.update({
      where: { id: file.id },
      data: { keywords: keywordsArray }
    });

    res.status(200).json({ success: true, keywords: keywordsArray });
  } catch (error) {
    console.error("AI Keywords Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const chatWithDocument = async (req, res) => {
  try {
    const genAI = getGenAI();
    if (!genAI) return res.status(500).json({ success: false, message: "Gemini API Key missing." });
    
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ success: false, message: "Message is required." });

    const file = await prisma.file.findUnique({ where: { id: Number(req.params.fileId) } });
    if (!file) return res.status(404).json({ success: false, message: "File not found." });

    const parts = await getMediaParts(file);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "I am providing a file for context. Please analyze it carefully so I can ask you questions about it." }, ...parts]
        },
        {
          role: "model",
          parts: [{ text: "I have analyzed the provided file. How can I help you?" }]
        },
        ...formattedHistory
      ]
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  summarizeDocument,
  extractKeywords,
  chatWithDocument
};

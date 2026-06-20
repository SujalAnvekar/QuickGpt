import imageKit from "../configs/imageKit.js";
import openai from "../configs/openAI.js";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import axios from 'axios'
// text based AI Chat msg controller
export const textMessage = async (req, res) => {
  try {
    const userId = req.user._id;

if(req.user.credits<1)
{
  return res.json({success:false,message:"You dont have enough credits to use this feature"})
}

    const { chatId, prompt } = req.body;

    // Validate input
    if (!chatId || !prompt?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Chat ID and prompt are required",
      });
    }

    const chat = await Chat.findOne({ userId, _id: chatId });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    const { choices } = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const reply = {
      ...choices[0].message,
      timestamp: Date.now(),
      isImage: false,
    };

    chat.messages.push(reply);

    await chat.save();

    await User.updateOne(
      { _id: userId },
      { $inc: { credits: -1 } }
    );

    return res.json({ success: true, reply });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// img generation api message
export const imageMessage = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.user.credits < 2) {
      return res.json({
        success: false,
        message: "You dont have enough credits to use this feature",
      });
    }

    const { prompt, chatId, isPublished } = req.body;

    const chat = await Chat.findOne({ userId, _id: chatId });

    if (!chat) {
      return res.json({
        success: false,
        message: "Chat not found",
      });
    }

    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

// encode prompt
    const encodedPrompt=encodeURIComponent(prompt)

    // construct ImageKit AI Generation URL
    const generatedImageUrl=`${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/QuickGpt/${Date.now()}.png?tr=w-800,h-800`;
// console.log("Generated URL:", generatedImageUrl);
    // trigger generation by fetchingfrom imagekit
    await new Promise(resolve => setTimeout(resolve, 10000));
    const aiImageResponse=await axios.get(generatedImageUrl,{responseType:"arraybuffer"})

    // convert to base64
    const base64Image=`data:image/png;base64,${Buffer.from(aiImageResponse.data,"binary").toString('base64')}`

    // upload to imagekit media library
    const uploadResponse=await imageKit.upload({
      file:base64Image,
      fileName:`${Date.now()}.png`,
      folder:"QuickGpt"
    })


     const reply = {
      role:'assistant',
      content:uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished
    };

    
    chat.messages.push(reply)
    await chat.save()
    
    await User.updateOne(
      { _id: userId },
      { $inc: { credits: -2 } }
    );
    
   return res.json({
  success: true,
  reply
});
    
  } catch (error) {
    console.error("ERROR STATUS:", error.response?.status);
  console.error("ERROR DATA:", error.response?.data);
  console.error("ERROR MESSAGE:", error.message);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
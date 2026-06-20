import express from 'express'
import { imageMessage, textMessage } from '../controllers/messageController.js'
import {protect} from '../middleware/auth.js'
const messageRouter=express.Router()

messageRouter.post('/text',protect,textMessage)
messageRouter.post('/image',protect,imageMessage)

export default messageRouter;

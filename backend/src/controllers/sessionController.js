import Session from "../models/Session.js"


export async function createSession(req, res) {
    try {
        const {problem, difficulty} = req.body
        const userId = req.user._id
        const clerkId = req.user.clerkId

        if(!problem || !difficulty){
            return res.status(400).json({message: "Problem and difficulty are required"})
        }

        //Generate a unique callId for stream Video
        const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`

        //create session in database
        const session = await Session.create({problem, difficulty, host: userId, clerkId, callId});

        //create stream video room using callId
        await streamClient.video.call("default", callId).getOrCreate({
            data:{
                created_by_id: clerkId,
                custom: { problem, difficulty, sessionId: session._id.toString()}
            }
        })

        //chat messaging
        StreamChatClient.channel("messaging",callId, {
            name: `${problem} Session`,
            created_by_id: clerkId,
            members: [clerkId]
        })

        await channel.create()

        res.status(201).json({message: "Session created successfully", sessionId: session._id, callId})

    } catch (error) {
        console.log("Error in creatSession controller:", error.message);
        res.status(500).json({message: "Internal server error"})
        
    }
}

export async function getActiveSessions(_, res) {
    try {
        const sessions = await Session.find({status:"active"})
        .populate("host", "name profileImage email clerkId")
        .sort({createdAt: -1})
        .limit(20);

        res.status(200).json({session})
    } catch (error) {
        console.log("Error in getActiveSession controller:", error.message);
        res.status(500).json({message: "Internal server error"})
    }
}

export async function getMyRecentSessions(req, res) {
    try {
        const userId = req.user._id
        //get sessions where user is either host or participant

        await Session.find({
            status:"completed",
            $or: [{host:userId }, { participant: userId}]
        })
        .sort({createdAt:-1})
        .limit(20);

        res.status(200).json({sessions})
    } catch (error) {
        console.log("Error in my getMyRecentSessions controller:", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export async function getSessionById(req, res) {
    try {
        const {id} = req.params

        const session = await Session.findById(id)
        .populate("host", "name email profileImage clerkId")
        .populate("participant", "name email profileImage clerkId")

        if(!session) return res.status(404).json({message: "Session not found"})

        res.status(200).json({session})
    } catch (error) {
        console.log("Error in my getSessionById controller:", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export async function joinSession(req, res) {
    try {
        const {id} = req.params
        const userId = req.user._id
        const clerkId = req.user.clerkId

        const session = await Session.findById(id)

        if(!session) return res.status(404).json({message: "Session not found"})

        if(session.status !== "active") return res.status(400).json({message: "Session is not active....Cannot join an completed session"})

        if(session.host.toString() === userId.toString()) return res.status(400).json({message: "You are the host of this session, So you cannot join as a participant"})

        // check if session is already full - has a participant
        if(session.participant) return res.status(409).json({message: "Session is already full"})

        session.participant = userId
        await session.save()

        const channel = chatClient.channel("messaging", session.callId)
        await channel.addMembers([clerkId])

        res.status(200).json({session})
    } catch (error) {
        console.log("Error in joinSession controller:", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export async function endSession(req, res) {
    try {
        const {id} = req.params
        const userId = req.user._id

        const session = await Session.findById(id)

        if(!session) return res.status(404).json({message: "Session not found"})

        // check if user is host or not
        if(session.host.toString() !=userId.toString()){
            return res.status(403).json({message: "You are not authorized to end this session"})
        }
        
        //check if session is completed
        if(session.status === "completed"){
            return res.status(400).json({message: "Session is already completed"})
        }

        session.status = "completed"
        await session.save()

        //delete stream video room
        const call = streamClient.video.call("default", session.callId)
        await call.delete({hard: true})

        //delete chat channel
        const channel = chatClient.channel("messaging", session.callId)
        await channel.delete()

        res.status(200).json({message: "Session ended successfully", session})


    } catch (error) {
        console.log("Error in endSession controller:", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}
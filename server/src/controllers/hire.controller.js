import crypto from 'crypto';
import dotenv from 'dotenv';
import Onboarding from '../models/Onboarding.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';

dotenv.config();

export async function getOnboarding(req, res) {
    try {
        const onboarding = req.onboarding;
        const {newHireName, startDate, progressPercent} = onboarding;
        const {name: organizationName} = onboarding.organizationId;

        const tasks = await Task.find({onboardingId: onboarding._id, assigneeRole: 'new_hire'});

        res.status(200).json({
            data: {
                newHireName,
                startDate,
                progressPercent,
                organizationName,
                tasks
            }
        })
    } catch(error) {
        console.log(error.message);
        res.status(500).json({message: 'Something went wrong'});
    }
}

export async function updateTask(req, res) {
    try {
        const onboarding = req.onboarding;
        const {taskId} = req.params;
        const {status, attachment} = req.body;

        let task = await Task.findById(taskId);

        if (!task) {
            console.log('Task not found.');
            return res.status(404).json({message: 'Task not found.'});
        }
        
        if (task.onboardingId.toString() !== onboarding._id.toString()) {
            console.log('This task does not belong to your onboarding.');
            return res.status(403).json({message: 'This task does not belong to your onboarding.'});
        }

        if (attachment && (!attachment.url || !attachment.fileName)) {
            console.log('Invalid attachment.');
            return res.status(400).json({message: 'Invalid attachment.'});
        }

        if (status === 'done' && task.requiresUpload && !attachment && task.attachments.length === 0) {
            console.log('This task requires a file upload before completion.');;
            return res.status(400).json({message: 'This task requires a file upload before completion.'});
        }

        const updatedTask = await Task.findByIdAndUpdate(taskId, {...(status && {$set: {status}}), ...(attachment && {$push: {attachments: attachment}})}, {new: true});

        const totalTasks = await Task.countDocuments({onboardingId: onboarding._id, assigneeRole: 'new_hire'})
        const doneTasks = await Task.countDocuments({onboardingId: onboarding._id, assigneeRole: 'new_hire', status: 'done'})
        const progressPercent = Math.round((doneTasks / totalTasks) * 100)

        await Onboarding.findByIdAndUpdate(onboarding._id, {progressPercent})

        res.status(200).json({
            data: updatedTask
        })        
    } catch(error) {
        console.log(error.message)
        res.status(500).json({message: 'Task could not be updated'})
    }
}

export async function signUpload (req, res) {
    try {
        const onboarding = req.onboarding
        const folder = `onboardings/${onboarding._id}`
        const timestamp = Math.round(Date.now() / 1000)
        const cloudinary_api_key = process.env.CLOUDINARY_API_KEY
        const cloud_name = process.env.CLOUDINARY_CLOUD_NAME
        const sign = crypto.createHash('sha1')
                           .update(`folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
                           .digest('hex')

        res.status(200).json({
            data: {
                sign,
                timestamp,
                cloudinary_api_key,
                cloud_name,
                folder
            }
        })
    } catch(error) {
        console.log(error.message)
        res.status(500).json({message: 'File could not be uploaded.'})
    }
}

export async function postComment (req, res) {
    try {
        const onboarding = req.onboarding
        const {taskId} = req.params
        const {content} = req.body
        const task = await Task.findById(taskId)

        if (!task) {
            console.log('Task not found.')
            return res.status(404).json({message: 'Task not found.'})
        }

        if (task.onboardingId.toString() !== onboarding._id.toString()) {
            console.log('This task does not belong to your onboarding.')
            return res.status(403).json({message: 'This task does not belong to your onboarding.'})
        }

        if (!content || content.trim() === '') {
            console.log('Comment content is required.')
            return res.status(400).json({message: 'Comment content is required'})
        }

        const comment = await Comment.create({taskId: taskId, authorId: null, authorDisplayName: onboarding.newHireName, body: content})

        res.status(201).json({
            data: comment
        })

    } catch(error) {
        console.log(error.message)
        res.status(500).json({message: 'Comment could not be posted.'})
    }
}
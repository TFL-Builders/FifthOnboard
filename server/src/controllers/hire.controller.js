import crypto from 'crypto';
import { hashToken } from "../config/jwt.js";
import { sendWelcomeEmail } from '../config/mailer.js';
import cloudinary from '../config/cloudinary.js';
import Onboarding from '../models/Onboarding.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import mongoose from 'mongoose';



export async function getOnboarding(req, res) {
    try {
        const onboarding = req.onboarding;
        const orgId = onboarding.organizationId;
        const {newHireName, startDate, progressPercent} = onboarding;
        const {name: organizationName} = onboarding.organizationId;

        const tasks = await Task.find({organizationId: orgId, onboardingId: onboarding._id, assigneeRole: 'new_hire', deletedAt: null});

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
        res.status(500).json({error: 'Something went wrong'});
    }
}

export async function updateTask(req, res) {
    try {
        const onboarding = req.onboarding;
        const orgId = onboarding.organizationId;
        const {taskId} = req.params;
        const {status, attachment} = req.body;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            console.log('Invalid task ID.')
            return res.status(400).json({error: 'Invalid task ID.'})
        }

        let task = await Task.findOne({_id: taskId, organizationId: orgId, deletedAt: null});

        if (!task) {
            console.log('Task not found.');
            return res.status(404).json({error: 'Task not found.'});
        }
        
        if (task.onboardingId.toString() !== onboarding._id.toString()) {
            console.log('This task does not belong to your onboarding.');
            return res.status(403).json({error: 'This task does not belong to your onboarding.'});
        }

        if (attachment && (!attachment.url || !attachment.fileName)) {
            console.log('Invalid attachment.');
            return res.status(400).json({error: 'Invalid attachment.'});
        }

        if (status === 'done' && task.requiresUpload && !attachment && task.attachments.length === 0) {
            console.log('This task requires a file upload before completion.');;
            return res.status(400).json({error: 'This task requires a file upload before completion.'});
        }

        const updatedTask = await Task.findOneAndUpdate(
            {_id: taskId, organizationId: orgId, deletedAt: null}, 
            {...(status && {$set: {status}}), ...(attachment && {$push: {attachments: attachment}})}, 
            {new: true, runValidators: true});

        if (!updatedTask) {
            console.log("Error: Task not found");
            return res.status(404).json({error: "Task not found"})
        }
        
        const totalTasks = await Task.countDocuments({onboardingId: onboarding._id, assigneeRole: 'new_hire'})
        const doneTasks = await Task.countDocuments({onboardingId: onboarding._id, assigneeRole: 'new_hire', status: 'done'})
        const progressPercent = Math.round((doneTasks / totalTasks) * 100)

        await Onboarding.findOneAndUpdate({_id: onboarding._id, organizationId: orgId, deletedAt: null}, {progressPercent})
        

        res.status(200).json({
            data: updatedTask
        })        
    } catch(error) {
        console.log(error.message)
        return res.status(500).json({error: 'Failed to update task.'})
    }
}

export async function signUpload (req, res) {
    try {
        const onboarding = req.onboarding
        const folder = `onboardings/${onboarding._id}`
        const timestamp = Math.round(Date.now() / 1000)
        const allowedFormats = 'pdf,jpg,png,docx'
        const maxFileSize = 10485760 // 10MB in bytes

        const sign = crypto.createHash('sha1')
                           .update(`allowed_formats=${allowedFormats}&folder=${folder}&max_file_size=${maxFileSize}&timestamp=${timestamp}${cloudinary.api_secret}`)
                           .digest('hex')

        res.status(200).json({
            data: {
                sign,
                timestamp,
                folder,
                allowed_formats: allowedFormats,
                max_file_size: maxFileSize,
                cloud_name: cloudinary.cloud_name,
                cloudinary_api_key: cloudinary.api_key
            }
        })
    } catch(error) {
        console.log(error.message)
        return res.status(500).json({error: 'File could not be uploaded.'})
    }
}

export async function postComment (req, res) {
    try {
        const onboarding = req.onboarding
        const orgId = onboarding.organizationId
        const {taskId} = req.params
        const {body} = req.body
        const task = await Task.findById(taskId)

        if (!task) {
            console.log('Task not found.')
            return res.status(404).json({error: 'Task not found.'})
        }

        if (task.onboardingId.toString() !== onboarding._id.toString()) {
            console.log('This task does not belong to your onboarding.')
            return res.status(403).json({error: 'This task does not belong to your onboarding.'})
        }

        const comment = await Comment.create({taskId: taskId, organizationId: orgId, authorId: null, authorDisplayName: onboarding.newHireName, body: body})

        res.status(201).json({
            data: comment
        })

    } catch(error) {
        console.log(error.message)
        return res.status(500).json({error: 'Comment could not be posted.'})
    }
}

export async function sendNewEmail(req, res) {
    try {
        const orgId = req.organizationId;
        const {onboardingId} = req.params;
        const onboarding = await Onboarding
                                .findOne({_id: onboardingId, organizationId: orgId, deletedAt: null})
                                .populate('organizationId', 'name');
        
        if (!onboarding) {
            console.log('Onboarding not found');
            return res.status(404).json({error: 'Onboarding not found'});
        }
        const email = onboarding.newHireEmail;
        const {name: organizationName} = onboarding.organizationId;

        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = hashToken(token);
        console.log('new-hire-token: ', token);

        await Onboarding.findOneAndUpdate(
            { _id: onboardingId, organizationId: orgId },
            { hirePortalTokenHash: tokenHash }
        )

        const inviteLink = `${process.env.CLIENT_URL}/hire/${token}`;
        console.log('new-hire-link: ', inviteLink);
        await sendWelcomeEmail(email, organizationName, inviteLink);
        console.log('Email sent: ', email);

        res.status(200).json({
            data: inviteLink
        });

    } catch(error) {
        console.log(error.message);
        return res.status(500).json({error: error.message})
    }
}

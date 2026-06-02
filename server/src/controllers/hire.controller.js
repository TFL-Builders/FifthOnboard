import crypto from 'crypto';
import { hashToken } from "../config/jwt.js";
import { sendOnboardingEmail } from '../config/mailer.js';
import cloudinary from '../config/cloudinary.js';
import Onboarding from '../models/Onboarding.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import { recomputeProgress } from "../utils/recomputeProgress.js";
import { TASK_STATUSES } from '../config/constants.js';
import mongoose from 'mongoose';



export async function getOnboarding(req, res) {
    try {
        const onboarding = req.onboarding;
        const {_id: onboardingId} = req.onboarding;
        const orgId = onboarding.organizationId;
        const {newHireName, startDate, progressPercent, job, status, newHireProgressPercent, managerId} = onboarding;
        const {name: organizationName} = onboarding.organizationId;

        let taskFilter = {organizationId: orgId, onboardingId, assigneeDepartment: 'new_hire'}
        
        if (req.query.status) {
    
            const statuses = req.query.status.split(",");
            const allValid = statuses.every(status => TASK_STATUSES.includes(status))
            if (!allValid) {
                return res.status(400).json({ error: "Invalid status value" });
            }
            taskFilter.status = { $in: statuses };
        }else{
            taskFilter.status = { $ne: 'blocked' };
        }

        const tasks = await Task.find(taskFilter);

        const shapedTasks = tasks.map(task => ({
            id: task._id,
            title: task.title,
            description: task.description,
            phase: task.phase,
            order: task.order,
            status: task.status,
            requiresUpload: task.requiresUpload,
            dueAt: task.status !== 'done' ? task.dueAt : undefined,
            completedAt: task.status === 'done' ? task.completedAt : undefined,
            blockedReason: task.status === 'blocked' ? task.blockedReason : undefined,
            attachments: task.requiresUpload && task.attachments?.length > 0
                ? task.attachments.map(a => ({
                    fileName: a.fileName,
                    url: a.url,
                    mimeType: a.mimeType,
                    uploadedAt: a.uploadedAt
                  }))
                : undefined,
        }));

        res.status(200).json({
            data: {
                newHireName,
                manager: onboarding.managerId?.name ?? "Unassigned",
                managerEmail: onboarding.managerId?.email ?? "No contact details",
                managerAvatarColor: onboarding.managerId?.avatarColor ?? null,
                job,
                status, 
                startDate,
                newHireProgressPercent,
                organizationName,
                tasks: shapedTasks
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

        let task = await Task.findOne({_id: taskId, organizationId: orgId, assigneeDepartment: 'new_hire'});

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
            console.log('This task requires a file upload before completion.');
            return res.status(400).json({error: 'This task requires a file upload before completion.'});
        }

        if (attachment) {
            attachment.uploadedByNewHire = onboarding._id;
        }

        const update= await Task.findOneAndUpdate(
            {_id: taskId, organizationId: orgId}, 
            {...(status && {$set: {status, completedAt: new Date()}}), ...(attachment && {$push: {attachments: attachment}})}, 
            {new: true, runValidators: true});

        if (!update) {
            console.log("Error: Task not found");
            return res.status(404).json({error: "Task not found"})
        }

        const updatedTask = {
            id: update._id,
            title: update.title,
            description: update.description,
            phase: update.phase,
            order: update.order,
            status: update.status,
            requiresUpload: update.requiresUpload,
            dueAt: update.status !== 'done' ? update.dueAt : undefined,
            completedAt: update.status === 'done' ? update.completedAt : undefined,
            blockedReason: update.status === 'blocked' ? update.blockedReason : undefined,
            attachments: update.requiresUpload && update.attachments?.length > 0
                ? update.attachments.map(a => ({
                    fileName: a.fileName,
                    url: a.url,
                    mimeType: a.mimeType,
                    uploadedAt: a.uploadedAt
                  }))
                : undefined,
        };

        const onboardingId = task.onboardingId;

        const [total, done] = await Promise.all([
            Task.countDocuments({ onboardingId, assigneeDepartment: 'new_hire' }),
            Task.countDocuments({ onboardingId, assigneeDepartment: 'new_hire', status: "done" })
        ]);
        
        const newHireProgress = total === 0 ? 0 : Math.floor((done / total) * 100);

        const updateFields = { newHireProgressPercent: newHireProgress };    
    
        await Onboarding.findByIdAndUpdate(
            onboardingId,
            {$set: updateFields}
        )
    
        await recomputeProgress(task.onboardingId);

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

        const onboarding = req.onboarding;
        const {taskId} = req.params;

         if (!mongoose.Types.ObjectId.isValid(taskId)) {
            console.log('Invalid task ID.')
            return res.status(400).json({error: 'Invalid task ID.'})
        }
        const folder = `onboardings/${onboarding._id}`;
        const timestamp = Math.round(Date.now() / 1000);
        const allowedFormats = 'pdf,jpg,png,docx';
        const maxFileSize = 10485760;
        const upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET;

        const task = await Task.findById(taskId).select('requiresUpload assigneeDepartment');

        if (!task.requiresUpload || task.assigneeDepartment !== 'new_hire'){
            console.log('Upload not required')
            return res.status(400).json({error: 'Upload not required.'})
        }

        const signatureString = `allowed_formats=${allowedFormats}&folder=${folder}&timestamp=${timestamp}&upload_preset=${upload_preset}${process.env.CLOUDINARY_API_SECRET}`

        const sign = crypto.createHash('sha1')
                           .update(signatureString)
                           .digest('hex')

        res.status(200).json({
            data: {
                sign,
                timestamp,
                folder,
                allowed_formats: allowedFormats,
                max_file_size: maxFileSize,
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                cloudinary_api_key: process.env.CLOUDINARY_API_KEY
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
        const task = await Task.findOne({_id: taskId, organizationId: orgId, assigneeDepartment: 'new_hire'})

        if (!task) {
            console.log('Task not found.')
            return res.status(404).json({error: 'Task not found.'})
        }

        if (task.onboardingId.toString() !== onboarding._id.toString()) {
            console.log('This task does not belong to your onboarding.')
            return res.status(403).json({error: 'This task does not belong to your onboarding.'})
        }

        const comment = await Comment.create({taskId: taskId, organizationId: orgId, authorId: null, authorDisplayName: onboarding.newHireName + " (New Hire)", body: body})

        res.status(201).json({
            data: {
                id: comment._id,
                taskId: comment.taskId,
                author: comment.authorId?.name ?? comment.authorDisplayName ?? "Unknown",
                body: comment.body,
                createdAt: comment.createdAt,
            }
        })

    } catch(error) {
        console.log(error.message)
        return res.status(500).json({error: 'Comment could not be posted.'})
    }
}

export async function getComments(req, res) {
    const {taskId} = req.params;
    const orgId = req.onboarding.organizationId;
    const onboarding = req.onboarding

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({ error: "Invalid task ID" });
    }

    
    try {
        const task = await Task.findOne({_id: taskId, organizationId: orgId, assigneeDepartment: 'new_hire'})
    
        if (!task) {
            console.log('Task not found.')
            return res.status(404).json({error: 'Task not found.'})
        }
    
        if (task.onboardingId.toString() !== onboarding._id.toString()) {
            console.log('This task does not belong to your onboarding.')
            return res.status(403).json({error: 'This task does not belong to your onboarding.'})
        }
        const comments = await Comment.find({
            taskId,
            organizationId: orgId,
            deletedAt: null
        })
        .populate('authorId', 'name avatarColor')
        .select('_id taskId authorId authorDisplayName body createdAt')
        .sort({ createdAt: 1 }); 

        const result = comments.map(c => ({
            id: c._id,
            author: c.authorId?.name ?? c.authorDisplayName ?? "Unknown",
            authorColor: c.authorId?.avatarColor ?? "#3B5BDB",
            body: c.body,
            createdAt: c.createdAt
        }));

        res.status(200).json({ data: result });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Unable to get task comments" });
    }
}

export async function sendNewEmail(req, res) {
    try {
        const orgId = req.organizationId;
        const {portalLink} = req.body;
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

        console.log('new-hire-link: ', portalLink);
        await sendOnboardingEmail(email, organizationName, portalLink);
        console.log('Email sent: ', email);

        res.status(200).json({
            message: "Email successfully sent"
        });

    } catch(error) {
        console.log(error.message);
        return res.status(500).json({error: error.message})
    }
}

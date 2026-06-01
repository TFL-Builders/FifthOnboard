import mongoose from "mongoose";
import Task from "../models/Task.js";
import Comment from "../models/Comment.js";
import { recomputeProgress } from "../utils/recomputeProgress.js";

export async function updateTask(req, res) {
    const orgId = req.organizationId;
    const taskId = req.params.id;
    const { status, blockedReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({ error: "Invalid task ID" });
    }

    try {
        const task = await Task.findOne({ 
            _id: taskId, 
            organizationId: orgId 
        });

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        // Security — non HR/admin can only update their own tasks
        if (!["hr", "admin"].includes(req.user.role)) {
            if (task.assigneeUserId?.toString() !== req.user.userId) {
                return res.status(403).json({ error: "You can only update tasks assigned to you" });
            }
        }

        // Block updates on cancelled onboarding tasks
        if (task.status === "blocked" && status === "blocked") {
            return res.status(409).json({ error: "Task is already blocked" });
        }

        // Build update fields
        const updateFields = {};

        if (status) {
            updateFields.status = status;

            // Clear blockedReason when moving away from blocked
            if (status !== "blocked") {
                updateFields.blockedReason = null;
            }

            // Set completedAt and completedBy when done
            if (status === "done") {
                updateFields.completedAt = new Date();
                updateFields.completedBy = req.user.userId;
            }

            // Clear completedAt and completedBy if reopening
            if (status !== "done") {
                updateFields.completedAt = null;
                updateFields.completedBy = null;
            }
        }

        if (status === "blocked" && blockedReason) {
            updateFields.blockedReason = blockedReason;
        }

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        // Recompute onboarding progress after status change
        await recomputeProgress(task.onboardingId);

        res.status(200).json({
            data: {
                id: updatedTask._id,
                status: updatedTask.status,
                blockedReason: updatedTask.blockedReason,
                completedAt: updatedTask.completedAt,
                completedBy: updatedTask.completedBy,
            }
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Unable to update task" });
    }
}

export async function addComment(req, res) {
    const orgId = req.organizationId;
    const taskId = req.params.id;
    const { body } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({ error: "Invalid task ID" });
    }

    try {
        // Confirm task exists and belongs to org
        const task = await Task.findOne({ 
            _id: taskId, 
            organizationId: orgId 
        });

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        const comment = await Comment.create({
            organizationId: orgId,
            taskId,
            authorId: req.user.userId,
            authorDisplayName: req.user.name,
            body,
        });

        await comment.populate('authorId', 'name');

        res.status(201).json({
            data: {
                id: comment._id,
                taskId: comment.taskId,
                author: comment.authorId?.name ?? comment.authorDisplayName ?? "Unknown",
                body: comment.body,
                createdAt: comment.createdAt,
            }
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Unable to add comment" });
    }
}

export async function getTaskComments(req, res) {
    const { id: taskId } = req.params;
    const orgId = req.organizationId;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({ error: "Invalid task ID" });
    }

    try {
        const comments = await Comment.find({
            taskId,
            organizationId: orgId,
            deletedAt: null
        })
        .populate('authorId', 'name avatarColor')
        .select('_id taskId authorId authorDisplayName body createdAt')
        .sort({ createdAt: 1 }); // oldest first for thread order

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
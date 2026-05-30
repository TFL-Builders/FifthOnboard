import mongoose from "mongoose";
import { hashToken } from "../config/jwt.js";
import crypto from "crypto";
import Onboarding from "../models/Onboarding.js";
import Template from "../models/Template.js";
import Task from "../models/Task.js";
import Organization from "../models/Organization.js";
import Comment from "../models/Comment.js";
import { DEPARTMENTS, ONBOARDING_STATUSES, TASK_STATUSES } from "../config/constants.js";

export async function createOnboarding(req, res){
    
    const { templateId, newHireName, newHireEmail, startDate, departmentMap, managerId } = req.body;
    const orgId = req.organizationId;
    const userId = req.user.userId;

    try{
        const exist = await Onboarding.findOne({ 
          organizationId: orgId, 
          newHireEmail, 
          status: { $ne: "cancelled" } 
        })

        if (exist) {
            console.log("error: An active onboarding already exists for this email" )
            return res.status(409).json({ error: "An active onboarding already exists for this email" });
        }

        const [template, orgDef] = await Promise.all([
          Template.findOne({ _id: templateId, organizationId: orgId, deletedAt: null }),
          Organization.findById(orgId).select('defaultDepartmentMap defaultManagerId')
        ]);

        if (!template || template.isArchived) {
            console.log("error: Template is archived or doesn't exist" )
            return res.status(404).json({ error: "Template is archived or doesn't exist" });
        }

        const templateDepartments = [...new Set(
            template.templateTasks
                .filter(t => t.assigneeDepartment !== "new_hire")
                .map(t => t.assigneeDepartment)
        )];

        
        const orgDefaultDepartmentMap = Object.fromEntries(orgDef?.defaultDepartmentMap ?? new Map());
        const finalDepartmentMap = {...orgDefaultDepartmentMap, ...departmentMap};
        const resolvedManagerId = managerId ?? orgDef.defaultManagerId ?? null;
        const hasNoManager = !resolvedManagerId;
        const hasUnassignedTasks = templateDepartments.some(
            department => department !== "manager" && !finalDepartmentMap[department]
        ) || (templateDepartments.includes("manager") && !resolvedManagerId);

        const warnings = {
            hasNoManager,
            hasUnassignedTasks
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = hashToken(rawToken);


        const newOnboarding = await Onboarding.create({
            organizationId: orgId,
            templateId,
            templateName: template.name,
            newHireName,
            newHireEmail,
            startDate,
            managerId: resolvedManagerId ?? null,
            createdBy: userId,
            status: "active",
            hirePortalTokenHash: tokenHash,
            warnings
        })

        console.log("resolvedManagerId:", resolvedManagerId);
        console.log("finalDepartmentMap:", finalDepartmentMap);

        
        const taskDocs = 
        template.templateTasks
        .map(t => {
                    const { _id, ...taskFields } = t.toObject();
                    return {
                        ...taskFields,            
                        organizationId: orgId,    
                        onboardingId: newOnboarding._id,
                        dueAt: new Date(new Date(startDate).getTime() + t.dueOffsetDays * 24 * 60 * 60 * 1000),
                        assigneeUserId: t.assigneeDepartment === "manager"
                            ? resolvedManagerId
                            : finalDepartmentMap[t.assigneeDepartment] ?? null,
                        status: "pending"
                    }
                });

        await Task.insertMany(taskDocs);

        res.status(201).json({
            data: {
                id: newOnboarding._id,
                newHireName,
                newHireEmail,
                startDate,
                status: "active",
                progressPercent: 0,
                managerId: resolvedManagerId,
                warnings: {
                    hasNoManager,
                    hasUnassignedTasks
                },
                hirePortalToken: rawToken,  // ← ONLY TIME this is ever sent
                taskCount: taskDocs.length,
            }
        });


    }catch(error){
        console.log(error.message);
        res.status(500).json({error: "Unable to create onboarding"})
    }
}

export async function listOnboardings(req, res){

    const orgId = req.organizationId;
    const validStatuses = ONBOARDING_STATUSES
    let onboardingFilter = { organizationId: orgId, deletedAt: null }

    if (req.query.status) {
        if (!validStatuses.includes(req.query.status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }
        onboardingFilter.status = req.query.status;
    }else{
        onboardingFilter.status = { $ne: 'cancelled' };
    }

    if(req.query.search){
        onboardingFilter.newHireName = { 
            $regex: req.query.search, 
            $options: "i"  
        };
    }

    if(req.user.role === "manager"){
        onboardingFilter.managerId = req.user.userId;
    }else if (req.query.managerId){
        onboardingFilter.managerId = req.query.managerId;
    }
    if (req.query.startDate){
        onboardingFilter.startDate = { $gte: new Date(req.query.startDate) };
    }

    try{
        const onboardings = await Onboarding.find(onboardingFilter).populate('managerId', 'name').select('newHireName templateName managerId progressPercent status warnings startDate').sort({ createdAt: -1 });

        if (onboardings.length === 0){
            return res.status(200).json({ data: [] });
        }

        const result = onboardings.map(o => ({
            id: o._id,
            newHireName: o.newHireName,
            templateName: o.templateName,
            manager: o.managerId?.name ?? "Unassigned",
            managerId: o.managerId._id ?? null,
            progressPercent: o.progressPercent,
            status: o.status,
            startDate: o.startDate,
            warnings: o.warnings,
        }));

        res.status(200).json({ data: result });

    }catch(error){
        console.log(error.message);
        res.status(500).json({error: "Unable to retrieve Onboardings"})
    }
}


export async function getOnboarding(req, res){

    const orgId = req.organizationId;
    const onboardingId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(onboardingId)) {
        console.log("error: Invalid template ID" )
        return res.status(400).json({ error: "Invalid onboarding ID" });
    }
    let onboardingFilter = {_id: onboardingId, organizationId: orgId, deletedAt: null }

    if(req.user.role === "manager"){
        onboardingFilter.managerId = req.user.userId;
    }

    try{
        const onboarding = await Onboarding.findOne(onboardingFilter).populate('managerId', 'name').populate('createdBy', 'name').select('_id newHireName newHireEmail templateName managerId progressPercent status warnings startDate hirePortalExpiresAt createdAt createdBy');

        if (!onboarding){
            return res.status(404).json({error: "Onboarding not found"});
        }

        const result = {
            id: onboarding._id,
            newHireName: onboarding.newHireName,
            newHireEmail: onboarding.newHireEmail,
            templateName: onboarding.templateName,
            manager: onboarding.managerId?.name ?? "Unassigned",
            managerId: onboarding.managerId ?? null,
            createdBy: onboarding.createdBy?.name ?? "Unknown",
            progressPercent: onboarding.progressPercent,
            status: onboarding.status,
            startDate: onboarding.startDate,
            warnings: onboarding.warnings,
            hirePortalExpiresAt: onboarding.hirePortalExpiresAt,
            createdAt: onboarding.createdAt
        };

        res.status(200).json({ data: result });

    }catch(error){
        console.log(error.message);
        res.status(500).json({error: "Unable to retrieve Onboarding"})
    }
}


export async function updateOnboarding(req, res){

    const orgId = req.organizationId;
    const onboardingId = req.params.id;
    const{newHireEmail, newHireName, managerId, departmentMap} = req.body;

    if (!mongoose.Types.ObjectId.isValid(onboardingId)) {
        console.log("error: Invalid template ID" )
        return res.status(400).json({ error: "Invalid onboarding ID" });
    }

    const onboardingFilter = {_id: onboardingId, organizationId: orgId, deletedAt: null }

    try{
        const [onboarding, unassignedTasks] = await Promise.all([
            Onboarding.findOne(onboardingFilter).select('newHireEmail managerId'),
            Task.exists({
                onboardingId,
                assigneeDepartment: { $ne: "new_hire" },
                assigneeUserId: null
            }),
            
        ])

        if (!onboarding){
            return res.status(404).json({error: "Onboarding not found"});
        }
        
        if(onboarding.newHireEmail !== newHireEmail){
            const exist = await Onboarding.findOne({newHireEmail});
            if(exist){
                return res.status(409).json({error: "Email is already onboarded"});
            }
        }

        
        if(unassignedTasks){
            const orgDef = await Organization.findById(orgId).select('defaultDepartmentMap defaultManagerId');
            const orgDefaultDepartmentMap = Object.fromEntries(orgDef?.defaultDepartmentMap ?? new Map());
            const finalDepartmentMap = {...orgDefaultDepartmentMap, ...departmentMap};

            // Update manager tasks if managerId is being set
            if (managerId) {
                await Task.updateMany(
                    { onboardingId, assigneeDepartment: "manager", assigneeUserId: null },
                    { $set: { assigneeUserId: managerId } }
                );
            }
            
            if (departmentMap) {
                const updates = Object.entries(finalDepartmentMap).map(([department, userId]) => {
                    if (!userId || department === "manager") return null;
                    return Task.updateMany(
                        { onboardingId, assigneeDepartment: department, assigneeUserId: null },
                        { $set: { assigneeUserId: userId } }
                    );
                }).filter(Boolean);
                await Promise.all(updates);
            }


        }

        
        
        const updateFields = { newHireName, newHireEmail };
        if (managerId && !onboarding.managerId) {
            updateFields.managerId = managerId;
        }

        const hasNoManager = managerId 
            ? false 
            : !onboarding.managerId; 

        const remainingUnassigned = await Task.exists({
            onboardingId,
            assigneeDepartment: { $ne: "new_hire" },
            assigneeUserId: null
        });

        const hasUnassignedTasks = !!remainingUnassigned;
        updateFields.warnings = {
            hasNoManager,
            hasUnassignedTasks
        }
        
        const updatedOnboarding = await Onboarding.findOneAndUpdate(
            onboardingFilter,
            {$set: updateFields},
            { new: true, runValidators: true }
        ).populate('managerId', 'name').populate('createdBy', 'name');

        if (!updatedOnboarding){
            console.log("Error: Onboarding not found");
            return res.status(404).json({error: "Onboarding not found"})
        }       


        const result = {
            id: updatedOnboarding._id,
            newHireName: updatedOnboarding.newHireName,
            newHireEmail: updatedOnboarding.newHireEmail,
            templateName: updatedOnboarding.templateName,
            manager: updatedOnboarding.managerId?.name ?? "Unassigned",
            createdBy: updatedOnboarding.createdBy?.name ?? "Unknown",
            progressPercent: updatedOnboarding.progressPercent,
            status: updatedOnboarding.status,
            startDate: updatedOnboarding.startDate,
            warnings: updatedOnboarding.warnings,
            hirePortalExpiresAt: updatedOnboarding.hirePortalExpiresAt,
            createdAt: updatedOnboarding.createdAt
        };

        res.status(200).json({ data: result });

    }catch(error){
        console.log(error.message);
        res.status(500).json({error: "Unable to retrieve Onboarding"})
    }
}

export async function cancelOnboarding(req, res){

    const orgId = req.organizationId;
    const onboardingId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(onboardingId)) {
        console.log("error: Invalid template ID" )
        return res.status(400).json({ error: "Invalid onboarding ID" });
    }

    const onboardingFilter = {_id: onboardingId, organizationId: orgId, deletedAt: null }

    try{
        const onboarding = await Onboarding.findOne(onboardingFilter)

        if (!onboarding){
            return res.status(404).json({error: "Onboarding not found"});
        }
        
        if(onboarding.status !== "active"){
            return res.status(409).json({error: "Only active onboardings can be cancelled"});
        }

        onboarding.status = "cancelled";
        await onboarding.save();
            
        await Task.updateMany(
            { onboardingId, status: { $nin: ["done"] } },
            { $set: { status: "blocked", blockedReason: "Onboarding cancelled"  } }
        )

        res.status(200).json({ message: "Onboarding has been successfully cancelled" });

    }catch(error){
        console.log(error.message);
        res.status(500).json({error: "Unable to cancel Onboarding"})
    }
}

export async function getOnboardingTasks(req, res){
    const orgId = req.organizationId;
    const onboardingId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(onboardingId)) {
        return res.status(400).json({ error: "Invalid onboarding ID" });
    }

    let taskFilter = { onboardingId, organizationId: orgId }

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

    if(req.query.department){
        taskFilter.assigneeDepartment = req.query.department;
    }

    if(req.query.assigneeUserId){
        taskFilter.assigneeUserId = req.query.assigneeUserId;
    }

    
    try{
        const tasks = await Task.find(taskFilter).populate('assigneeUserId', 'name').populate('completedBy', 'name').sort({ phase: 1, order: 1 });
    
        const onboardingTasks = tasks.map(task => {
            const base = {
                id: task._id,
                title: task.title,
                description: task.description,
                assigneeDepartment: task.assigneeDepartment,
                phase: task.phase,
                order: task.order,
                status: task.status,
                requiresUpload: task.requiresUpload,
            };
        
            if (task.status === "done") {
                return {
                    ...base,
                    completedBy: task.completedBy?.name ?? "Unknown",
                    completedAt: task.completedAt,
                    attachments: task.requiresUpload && task.attachments.length > 0
                        ? task.attachments.map(a => ({
                            fileName: a.fileName,
                            url: a.url,
                            mimeType: a.mimeType,
                            uploadedAt: a.uploadedAt
                          }))
                        : undefined,
                };
            }
        
            if (task.status === "blocked") {
                return {
                    ...base,
                    assignee: task.assigneeUserId?.name ?? "Unassigned",
                    blockedReason: task.blockedReason,
                };
            }
        
            return {
                ...base,
                assignee: task.assigneeUserId?.name ?? "Unassigned",
                dueAt: task.dueAt,
            };
        });

        res.status(200).json({data: onboardingTasks});

    }catch(error){
        console.log(error.message);
        res.status(500).json({error: "Unable to get Onboarding tasks"})
    }
}

export async function getOnboardingComments(req, res){
    const orgId = req.organizationId;
    const onboardingId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(onboardingId)) {
        return res.status(400).json({ error: "Invalid onboarding ID" });
    }

    let taskFilter = { onboardingId, organizationId: orgId }
    
    try{
        const tasks = await Task.find(taskFilter).select('_id title status');
        if (tasks.length === 0) {
            return res.status(200).json({ data: [] });
        }

        const taskIds = tasks.map(t => t._id)
        const taskMap = {};
        tasks.forEach(t => taskMap[t._id.toString()] = {
            title: t.title,
            status: t.status
        });

        const comments = await Comment.find({
            taskId: { $in: taskIds },
            organizationId: orgId,
            deletedAt: null
        })
        .populate('authorId', 'name')
        .select('_id taskId authorId authorDisplayName body createdAt')
        .sort({ createdAt: -1 });

        const taskComments = comments.map(comment => {
            return {
                id: comment._id,
                taskId: comment.taskId,
                taskTitle: taskMap[comment.taskId.toString()]?.title ?? "Unknown task",
                taskStatus: taskMap[comment.taskId.toString()]?.status,
                author: comment.authorId?.name ?? comment.authorDisplayName ?? "Unknown",
                body: comment.body,
                createdAt: comment.createdAt
            }
        })
    

        res.status(200).json({data: taskComments});

    }catch(error){
        console.log(error.message);
        res.status(500).json({error: "Unable to get task comments"})
    }
}
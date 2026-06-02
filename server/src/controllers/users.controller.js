import mongoose from 'mongoose';
import Onboarding from '../models/Onboarding.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import { ASSIGNEE_DEPARTMENTS, USER_ROLES, USER_STATUSES, TASK_STATUSES } from '../config/constants.js';

export async function getUsers(req, res) {
    try {
        const orgId = req.organizationId;
        const { role, department, status, search } = req.query
        
        let userFilter = { organizationId: orgId, deletedAt: null , role: {$ne: 'admin'}}
        
        if(role) {
            if (!USER_ROLES.includes(role)) {
                return res.status(400).json({error: 'Invalid role.'});
            }
            userFilter.role = role;
        }

        if (department) {
            if (!ASSIGNEE_DEPARTMENTS.includes(department)) {
                return res.status(400).json({error: 'Invalid department'})
            }
            userFilter.department = department;
        }
        
        const resolvedStatus = status ?? 'active';
        if (!USER_STATUSES.includes(resolvedStatus)) {
            return res.status(400).json({ error: 'Invalid status value.' });
        }
        userFilter.status = resolvedStatus;

        if (search) {
            userFilter.name = {
                $regex: search,
                $options: 'i'
            };
        }
        
        console.log(userFilter)
        const users = await User.find(userFilter).select('name email role department status avatarColor createdAt');

        const result = users.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            department: u.department,
            status: u.status,
            avatarColor: u.avatarColor,
            createdAt: u.createdAt
        }));

        res.status(200).json({ data: result });

    } catch(error) {
        console.log('Failed to get users: ', error.message)
        return res.status(500).json({error: 'Something went wrong.'})
    }
}

export async function getUser(req, res) {
    try {
        const orgId = req.organizationId
        const {id: employeeId} = req.params

        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ error: 'Invalid user ID.' });
        }

        const user = await User.findOne({_id: employeeId, organizationId: orgId, deletedAt: null,  role: {$ne: 'admin'}})
                               .select('name email role department status avatarColor createdAt');
        if (!user) {
            console.log('User could not be found.')
            return res.status(404).json({error: 'User could not be found.'})
        }

        res.status(200).json({ data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            status: user.status,
            avatarColor: user.avatarColor,
            createdAt: user.createdAt
        }});
                
    } catch(error) {
        console.log('Failed to get user: ', error.message)
        return res.status(500).json({error: 'Something went wrong.'})
    }
}

export async function getUserTasks(req, res) {
    try{
        const orgId = req.organizationId
        const {id: employeeId} = req.params

        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ error: 'Invalid user ID.' });
        }

        const taskFilter = { organizationId: orgId, assigneeUserId: employeeId }
        
        if (req.query.disable) {
            taskFilter.status = {$ne: 'done'};

            const [onboardingIds, totalTasks] = await Promise.all([
                Task.distinct('onboardingId', taskFilter),
                Task.find(taskFilter)
            ])

            const result = await Onboarding.find({organizationId: orgId, _id: {$in: onboardingIds}}).populate('templateId', 'name').select('_id newHireName');

            const affectedOnboardings = result.map(onboarding => {

                const tasks = totalTasks.map(task => {
                        if (task.onboardingId.toString() === onboarding._id.toString()){
                            return task;
                        }
                    })
                
                return {
                    id: onboarding._id,
                    newHireName,
                    onboardingTaskCount: tasks.length
                }
            })

            const finalResult = {
                affectedOnboardings,
                totalTaskCount: totalTasks.length,
            }

            res.status(200).json({data: finalResult});
        }
        
        if (req.query.status) {

            const statuses = req.query.status.split(',');
            const allValid = statuses.every(status => TASK_STATUSES.includes(status))
            if (!allValid) {
                return res.status(400).json({error: 'Invalid status value'})
            }
            taskFilter.status = { $in: statuses };
        } else {
            taskFilter.status = { $ne: 'blocked' }; 
        }

        const user = await User.findOne({_id: employeeId, organizationId: orgId, deletedAt: null})
        if (!user) {
            return res.status(404).json({error: 'User not found.'})
        }

        const [onboardingIds, tasks] = await Promise.all([
            Task.distinct('onboardingId', {assigneeUserId: employeeId, organizationId: orgId}),
            Task.find(taskFilter)
        ])

        const result = await Onboarding.find({organizationId: orgId, _id: {$in: onboardingIds}, deletedAt: null}).populate('templateId', 'name').select('_id newHireName templateId');

        const finalResult = result.map(onboarding => {
            return {
                onboardingId: onboarding._id,
                newHireName: onboarding.newHireName,
                templateName: onboarding.templateId?.name ?? 'Unknown',
                tasks: tasks
                    .filter(task => task.onboardingId.toString() === onboarding._id.toString())                    
                    .map(task => {
                        return {
                            id: task._id,
                            title: task.title,
                            status: task.status,
                            phase: task.phase,
                            dueAt: task.dueAt,
                            requiresUpload: task.requiresUpload
                        }
                    }
                )
            }
        })

        res.status(200).json({data: finalResult})

    } catch(error) {
        console.log('Failed to get user tasks: ', error.message)
        return res.status(500).json({error: 'Something went wrong.'})
    }
}

export async function deleteUser(req, res){
    const disableId = req.params.id;
    const orgId = req.organizationId;
    const reassignToId = req.body.id ?? null;

    const roleHierarchy = {
        admin:      4,
        hr:         3,
        manager:    2,
        task_owner: 1,
        employee:   1
    };

    if (!mongoose.Types.ObjectId.isValid(disableId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }
    if (reassignToId && !mongoose.Types.ObjectId.isValid(reassignToId)) {
        return res.status(400).json({ error: "Invalid reassign user ID" });
    }
    
    try{
        const targetUser = await User.findOne({_id: disableId, organizationId: orgId, status: {$ne: 'disabled'}});

        if(!targetUser){
            console.log("Error: User doesn't exist");
            return res.status(404).json({error: "User not found"});
        }

        if (req.user.userId === disableId) {
            console.log("Error: You cannot disable your own account")
            return res.status(400).json({ error: "You cannot disable your own account" });
        }

        const requestorLevel = roleHierarchy[req.user.role];
        const targetLevel = roleHierarchy[targetUser.role];

        if (targetLevel >= requestorLevel) {
            console.log("Error! Hierarchy too low:", requestorLevel)
            return res.status(403).json({error: "Unauthorized"});
        }

        targetUser.status = 'disabled';

        await targetUser.save();

        const affectedTasks = await Task.find({
            assigneeUserId: disableId,
            status: { $nin: ["done"] },
            organizationId: orgId
        }).select('onboardingId');

        const affectedOnboardingIds = [...new Set(
            affectedTasks.map(t => t.onboardingId.toString())
        )];

        if(!reassignToId){
            const updatedTasks = await Task.updateMany({ assigneeUserId: disableId, status: { $nin: ["done"] } },
            { $set: { assigneeUserId: null } })

            await Promise.all(
                affectedOnboardingIds.map(async (onboardingId) => {
                    const hasUnassigned = await Task.exists({
                        onboardingId,
                        assigneeDepartment: { $ne: "new_hire" },
                        assigneeUserId: null
                    });
                
                    const onboarding = await Onboarding.findById(onboardingId)
                        .select('managerId');

                    const newManagerId = onboarding.managerId?.toString() === disableId.toString()
                    ? null
                    : onboarding.managerId;
                
                    await Onboarding.findByIdAndUpdate(onboardingId, {
                        $set: {
                            'warnings.hasUnassignedTasks': !!hasUnassigned,
                            'warnings.hasNoManager': !newManagerId,
                            managerId: newManagerId
                        }
                    });
                })
            );

            return res.status(200).json({
                data:  { disabled: true, reassigned: false, tasksAffected: updatedTasks.modifiedCount, onboardingsAffected: affectedOnboardingIds.length }
            })
           

        }
        
        const reassignTo = await User.findOne({_id: reassignToId, organizationId: orgId, status: {$ne: 'disabled'}})

        if(!reassignTo){
            console.log("Error: User doesn't exist");
            return res.status(404).json({error: "User not found"});
        }

        if(targetUser.role === 'manager'){
           const [resolvedTasks, updatedOnboardings] = await Promise.all([
                Task.updateMany({ assigneeUserId: disableId, status: { $nin: ["done"] } },
                { $set: { assigneeUserId: reassignToId } }),
                Onboarding.updateMany({ _id: { $in: affectedOnboardingIds }},
                    { $set: { managerId: reassignToId } }
                )
            ])

            return res.status(200).json({
                data:  { disabled: true, reassigned: true, tasksResolved: resolvedTasks.modifiedCount, onboardingsUpdated: affectedOnboardingIds.length }
            })
        }

       const resolvedTasks = await Task.updateMany({ assigneeUserId: disableId, status: { $nin: ["done"] } },
                { $set: { assigneeUserId: reassignToId } })

        res.status(200).json({
            data:  { disabled: true, reassigned: true, tasksResolved: resolvedTasks.modifiedCount, onboardingsUpdated: affectedOnboardingIds.length }
        })

    }catch(error){
        console.log(error.message);
        res.status(500).json({error: "User delete operation failed"});
    }

}

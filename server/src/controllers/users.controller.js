import mongoose from 'mongoose';
import Onboarding from '../models/Onboarding.js';
import User from '../models/User.js';
import Task from '../models/Task.js';

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
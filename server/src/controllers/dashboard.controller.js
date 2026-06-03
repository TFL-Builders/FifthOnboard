import mongoose from 'mongoose';
import Organization from '../models/Organization.js';
import User from '../models/User.js';

export async function getSettings(req, res) {
    const orgId = req.organizationId;

    try {
        const org = await Organization.findById(orgId)
            .select('defaultDepartmentMap defaultManagerId');

        if (!org) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Collect all userIds to populate in one query
        const departmentMap = Object.fromEntries(org.defaultDepartmentMap ?? new Map());
        const allUserIds = [
            ...Object.values(departmentMap).filter(Boolean),
            org.defaultManagerId
        ].filter(Boolean);

        const users = await User.find({
            _id: { $in: allUserIds },
            organizationId: orgId
        }).select('name avatarColor department role');

        // Build a lookup map
        const userLookup = {};
        users.forEach(u => {
            userLookup[u._id.toString()] = {
                id: u._id,
                name: u.name,
                avatarColor: u.avatarColor ?? null,
            };
        });

        // Shape defaultDepartmentMap
        const shapedDepartmentMap = {};
        for (const [dept, userId] of Object.entries(departmentMap)) {
            shapedDepartmentMap[dept] = userId
                ? userLookup[userId.toString()] ?? null
                : null;
        }

        // Shape defaultManagerId
        const shapedManager = org.defaultManagerId
            ? userLookup[org.defaultManagerId.toString()] ?? null
            : null;

        res.status(200).json({
            data: {
                defaultDepartmentMap: shapedDepartmentMap,
                defaultManagerId: shapedManager,
            }
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Failed to fetch settings" });
    }
}


export async function updateSettings(req, res) {
    const orgId = req.organizationId;
    const { defaultDepartmentMap, defaultManagerId } = req.body;

    try {
        const org = await Organization.findById(orgId);

        if (!org) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Collect all userIds to validate they exist in this org
        const incomingUserIds = [
            ...Object.values(defaultDepartmentMap ?? {}).filter(Boolean),
            defaultManagerId
        ].filter(Boolean);

        if (incomingUserIds.length > 0) {
            const validUsers = await User.find({
                _id: { $in: incomingUserIds },
                organizationId: orgId,
                status: { $ne: 'disabled' }
            }).select('_id');

            const validIds = new Set(validUsers.map(u => u._id.toString()));

            const invalidId = incomingUserIds.find(
                id => !validIds.has(id.toString())
            );

            if (invalidId) {
                return res.status(400).json({ 
                    error: "One or more users not found in this organization" 
                });
            }
        }

        // Update defaultDepartmentMap
        if (defaultDepartmentMap) {
            for (const [dept, userId] of Object.entries(defaultDepartmentMap)) {
                if (userId) {
                    org.defaultDepartmentMap.set(dept, userId);
                } else {
                    org.defaultDepartmentMap.delete(dept);
                }
            }
        }

        // Update defaultManagerId
        if (defaultManagerId !== undefined) {
            org.defaultManagerId = defaultManagerId ?? null;
        }

        await org.save();

        res.status(200).json({
            data: { message: "Settings updated successfully" }
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Failed to update settings" });
    }
}
import { hashToken } from "../config/jwt.js";
import Onboarding from '../models/Onboarding.js';

export async function validateHireToken(req, res, next) {
    try {
        const {token} = req.params

        if (!token) {
            console.log('Portal token is required')
            return res.status(400).json({error: 'Portal token is required.'});
        }

        const tokenHash = hashToken(token);
        const onboarding = await Onboarding.findOne({hirePortalTokenHash: tokenHash, deletedAt: null}).populate('organizationId', 'name').populate('managerId', 'name email avatarColor');

        if (!onboarding) {
            console.log('Portal not found.')
            return res.status(404).json({error: 'Portal not found.'})
        }

        if (onboarding.status === 'cancelled') {
            return res.status(410).json({ error: 'This onboarding has been cancelled.' });
        }

        if (onboarding.hirePortalExpiresAt < new Date()) {
            console.log('Expired portal link')
            return res.status(410).json({error: 'This portal link has expired.'})
        }

        req.onboarding = onboarding
        next()
    } catch(error){
        console.log(error.message)
        return res.status(500).json({error: 'Something went wrong.'})
    }
}
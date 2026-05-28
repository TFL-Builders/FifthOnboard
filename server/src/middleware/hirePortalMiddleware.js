import crypto from 'crypto';
import Onboarding from '../models/Onboarding.js';

export async function validateHireToken(req, res, next) {
    try {
        const {token} = req.params

        if (!token) {
            console.log('Portal token is required')
            return res.status(400).json({message: 'Portal token is required.'});
        }

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const onboarding = await Onboarding.findOne({hirePortalTokenHash: tokenHash}).populate('organizationId', 'name');

        if (!onboarding) {
            console.log('Portal not found.')
            return res.status(404).json({message: 'Portal not found.'})
        }

        if (onboarding.hirePortalExpiresAt < new Date()) {
            console.log('Expired portal link')
            return res.status(410).json({message: 'This portal link has expired.'})
        }

        req.onboarding = onboarding
        next()
    } catch(error){
        console.log(error.message)
        return res.status(500).json({message: 'Something went wrong.'})
    }
}
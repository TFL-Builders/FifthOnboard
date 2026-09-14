import mongoose from 'mongoose';
import crypto from 'crypto';
import { hashToken } from '../config/jwt.js';
import Invite from '../models/Invite.js';
import User from '../models/User.js';

export async function sendInvite(req, res) {
    try {
        const {email, role, department} = req.body;
        const orgId = req.organizationId;
        const exist = await User.findOne({email, organizationId: orgId});

        if (exist) {
            console.log('Email already exists in organization.');
            return res.status(409).json({error: 'Email already exists in organization.'});
        }
        const pendingInvite = await Invite.findOne({email, organizationId: orgId});
        if (pendingInvite) {
            console.log('An invite has already been sent to this email.');
            return res.status(409).json({error: 'An invite has already been sent to this email.'});
        }

        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = hashToken(token);

        await Invite.create({
            organizationId: orgId,
            email,
            role,
            department,
            tokenHash,
            status: 'pending',
            invitedBy: req.user.userId
        })

        const inviteLink = `${process.env.CLIENT_URL}/accept-invite/${token}`
        console.log(token);
        console.log('invite_link: ', inviteLink)
        // await sendInviteEmail() dont forget to make the function to actually send the mail

        res.status(201).json({message: 'Invite sent successfully.'})

    } catch(error) {
        console.log(error.message);
        res.status(500).json({error: 'Something went wrong.'})
    }
}

export async function acceptInvite(req, res) {
    try {
        const {token} = req.params;
        const {name, password} = req.body;
        const tokenHash = hashToken(token);
        const invite = await Invite.findOne({tokenHash: tokenHash});

        if (!invite) {
            console.log('Invite not found.');
            return res.status(404).json({error: 'Invite not found.'})
        }
        if (Date.now() > invite.expiresAt?.getTime()) {
            console.log('Invite link expired');
            return res.status(410).json({error: 'Invite link expired.'});
        } 
        if (invite.acceptedAt !== null) {
            console.log('Invite has already been accepted');
            return res.status(409).json({error: 'Invite has already been accepted.'});
        }

        const user = await User.create({
            email: invite.email,
            name: name,
            department: invite.department,
            passwordHash: password,
            role: invite.role,
            organizationId: invite.organizationId,
            status: 'active'
        })

        const accepted = await Invite.findOneAndUpdate({tokenHash: tokenHash}, {$set: {acceptedAt: new Date(), status: 'accepted'}}, {new: true})
        if (!accepted) {
            console.log('Invite could not be accepted')
            return res.status(500).json({error: 'Invite could not be accepted'}); 
        }
        
        res.status(201).json({message: 'Invite accepted successfully. Use your credentials to login.'})

    } catch(error) {
        console.log(error.message);
        res.status(500).json({error: 'Something went wrong'});
    }
}

export async function getInvites(req, res){
    const orgId = req.organizationId;
    
    try{
        const invites = await Invite.find({organizationId: orgId, status: 'pending', acceptedAt: null}).select('_id email role department status createdAt expiresAt');

        const inviteList = invites.map(invite => ({
            id: invite._id,
            email: invite.email,
            role: invite.role,
            department: invite.department,
            status: invite.status,
            createdAt: invite.createdAt,
            expiresAt: invite.expiresAt
        }))

        if (invites.length === 0){
            return res.status(200).json({ data: [] });
        }

        res.status(200).json({
            data: inviteList
        })
    }catch(error){
        console.log(error.message);
        res.status(500).json({error: "Error Invites couldn't be gotten"});
    }
}   

export async function deleteInvite(req, res){
    const inviteId = req.params.id;
    const orgId = req.organizationId;

    if (!mongoose.Types.ObjectId.isValid(inviteId)) {
         console.log("error: Invalid invite ID" )
         return res.status(400).json({ error: "Invalid onboarding ID" });
    }
    
    try{
        const invite = await Invite.findOne({_id: inviteId, organizationId: orgId});
    
        if (!invite){
            console.log("Error: Invite not found");
            return res.status(404).json({error: "Invite not found"})
        }
    
        if (invite.status === 'accepted'){
            console.log("Error: Delete operation failed");
           return  res.status(409).json({error: "Delete operation failed"})
        }
    
        invite.expiresAt = new Date();
        await invite.save();
    
        res.status(200).json({message: "Invite has been successfully revoked"});

    }catch(error){
        console.log(error.message);
        res.status(500).json({error: "Delete operation failed"});
    }

}
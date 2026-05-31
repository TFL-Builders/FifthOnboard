import mongoose from "mongoose";
import Template from "../models/Template.js";
import slugify from "slugify";
import { engineeringSeedTemplate } from "../config/constants.js";

function daysAgo(date) {
    const ms = Date.now() - new Date(date).getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
}


export async function listTemplates(req, res){
    const filter = req.query.filter;
    const orgId = req.organizationId;
    const onboarding = req.query.onboarding;

    console.log("req.user:", req.user);
    console.log("req.organizationId:", req.organizationId);
    console.log("orgId being queried:", orgId);
    
    let templates = [];
    
    try{
         if (onboarding === "true") {
            const templates = await Template.find({
                organizationId: orgId,
                isArchived: false,
                deletedAt: null
            }).select('_id name');
            return res.status(200).json({ data: templates });
        }

        if (!filter || filter === "active"){
           templates = await Template.find({ organizationId: orgId, isArchived: false, deletedAt: null }).select('_id name updatedAt templateTasks');
        }else if(filter === "archived"){
            templates = await Template.find({ organizationId: orgId, isArchived: true, deletedAt: null}).select('_id name updatedAt templateTasks');
        }else if(filter === "all"){
            templates = await Template.find({ organizationId: orgId, deletedAt: null}).select('_id name updatedAt templateTasks');
        }else {
            return res.status(400).json({ error: "Invalid filter. Use active, archived, or all." });
        }

        const result = templates.map(t => ({
            id: t._id,
            name: t.name,
            updatedAt: daysAgo(t.updatedAt),
            taskCount: t.taskCount
        }));

        res.status(200).json({data: result});

    }catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: 'Failed to fetch templates' });
    }
}

export async function getTemplate(req, res){
    const templateId = req.params.id;
    const orgId = req.organizationId;
    const departmentsOnly = req.query.departmentsOnly

    if (!mongoose.Types.ObjectId.isValid(templateId)) {
        console.log("error: Invalid template ID" )
        return res.status(400).json({ error: "Invalid template ID" });
    }

    
    try{
        const templateData = await Template.findOne({organizationId: orgId, _id: templateId, deletedAt: null }).select('name description createdBy templateTasks updatedAt').populate('createdBy', 'name');
        
        if (templateData){

            if (departmentsOnly === "true") {
                const departments = [...new Set(
                    templateData.templateTasks.map(t => t.assigneeDepartment)
                )];
                return res.status(200).json({ data: { departments } });
            }

            const template = {
                id: templateData._id,
                name: templateData.name,
                description: templateData.description,
                createdBy: templateData.createdBy?.name ?? "Unknown",
                tasks: templateData.templateTasks,
                updatedAt: daysAgo(templateData.updatedAt)
            }
            
            res.status(200).json({data: template});
        }else{
            console.log("error: Template not found" );
            return res.status(404).json({ error: "Template not found" });
        }
    }catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: 'Failed to fetch template with id:', templateId });
    }
}

export async function getTemplateDefault(req, res) {
    console.log(engineeringSeedTemplate.name);
    return res.status(200).json({data: engineeringSeedTemplate})
}

export async function createTemplate(req, res){
    const{name, description, templateTasks} = req.body;
    const orgId = req.organizationId;
    const userId = req.user.userId;
    const slug = slugify(name, {
            lower: true,
            strict: true,
            trim: true
        })
        
    try{
        const exists = await Template.findOne({slug: slug, organizationId: orgId, deletedAt: null });
        if (exists){
            console.log("Error: Template already exists");
            return res.status(409).json({error: "Template already exists"});
        }
        
        const newTemplate = new Template({
            name,
            slug,
            description,
            templateTasks,
            createdBy: userId,
            organizationId: orgId,
        });

        await newTemplate.save();
        await newTemplate.populate('createdBy', 'name');

        res.status(201).json({
            data: {
                id: newTemplate._id,
                name: newTemplate.name,
                description: newTemplate.description,
                createdBy: newTemplate.createdBy?.name ?? "Unknown",
                templateTasks: newTemplate.templateTasks,
                updatedAt: newTemplate.updatedAt,
            }
        });

    }catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: 'Failed to create template'});
    }
}

export async function updateTemplate(req, res){
    const templateId = req.params.id;
    const orgId = req.organizationId;

    if (!mongoose.Types.ObjectId.isValid(templateId)) {
        console.log("error: Invalid template ID" )
        return res.status(400).json({ error: "Invalid template ID" });
    }

    const {name, description, templateTasks} = req.body;

    const slug = slugify(name, {
            lower: true,
            strict: true,
            trim: true
        })

        
    try{
        const conflict = await Template.findOne({
            slug,
            organizationId: orgId,
            _id: { $ne: templateId },   
            deletedAt: null
        });

        if(conflict){
            console.log("Error: Template name is already taken");
            return res.status(409).json({error: "Template name is already taken"});
        }

        const updated = await Template.findOneAndUpdate(
            { _id: templateId, organizationId: orgId, deletedAt: null },
            { $set: { name, slug, description, templateTasks } },
            { new: true, runValidators: true }
        ).select('name description createdBy templateTasks updatedAt').populate('createdBy', 'name');

        if (!updated){
            console.log("Error: Template not found");
            return res.status(404).json({error: "Template not found"})
        }
        
        res.status(200).json({
            data: {
                id: updated._id,
                name: updated.name,
                description: updated.description,
                createdBy: updated.createdBy?.name ?? "Unknown",
                templateTasks: updated.templateTasks,
                updatedAt: updated.updatedAt,
            }
        });

    }catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: 'Failed to update template'});
    }
}

export async function archiveTemplate(req, res){
    const templateId = req.params.id;
    const orgId = req.organizationId;

    if (!mongoose.Types.ObjectId.isValid(templateId)) {
        console.log("error: Invalid template ID" )
        return res.status(400).json({ error: "Invalid template ID" });
    }

    
    try{
        const template = await Template.findOne({ _id: templateId, organizationId: orgId, deletedAt: null });
        if(!template){
            console.log("Error: Template not found");
            return res.status(404).json({error: "Template not found"});
        }else if(template.isArchived === true){
            console.log("Error: Template is already archived");
            return res.status(409).json({error: "Template is alreeady archived"});
        }
    
        template.isArchived = true;
        await template.save();
        return res.status(200).json({ data: { message: "Template archived successfully" } })
    }catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: 'Failed to archive template'});
    }

}

export async function unarchiveTemplate(req, res){
    const templateId = req.params.id;
    const orgId = req.organizationId;

    if (!mongoose.Types.ObjectId.isValid(templateId)) {
        console.log("error: Invalid template ID" )
        return res.status(400).json({ error: "Invalid template ID" });
    }

    
    try{
        const template = await Template.findOne({ _id: templateId, organizationId: orgId, deletedAt: null });
        if(!template){
            console.log("Error: Template not found");
            return res.status(404).json({error: "Template not found"});
        }else if(template.isArchived === false){
            console.log("Error: Template is already unarchived");
            return res.status(409).json({error: "Template is alreeady unarchived"});
        }
    
        template.isArchived = false;
        await template.save();
        return res.status(200).json({ data: { message: "Template unarchived successfully" } })
    }catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: 'Failed to unarchive template'});
    }

}

export async function cloneTemplate(req, res){
    const templateId = req.params.id;
    const orgId = req.organizationId;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(templateId)) {
        console.log("error: Invalid template ID" )
        return res.status(400).json({ error: "Invalid template ID" });
    }

    
    try{
        const original = await Template.findOne({_id: templateId, organizationId: orgId, deletedAt: null }).select('name description templateTasks slug');

        if (!original) {
            console.log("Error: Template not found")
            return res.status(404).json({ error: "Template not found" });
        }

        let cloneName = `${original.name} (Copy)`;
        let counter = 2;
    
        while (await Template.findOne({ slug: slugify(cloneName, {
                lower: true,
                strict: true,
                trim: true
            }), organizationId: orgId, deletedAt: null })) {
            cloneName = `${original.name} (Copy ${counter})`;
            counter++;
        }
    
        const slug = slugify(cloneName, {
                lower: true,
                strict: true,
                trim: true
            });
    
    
        const clonedTasks = original.templateTasks.map(task => {
            const t = task.toObject();
            delete t._id;
            return t;
        })

        const clone = new Template({
            name: cloneName,
            slug,
            description: original.description,
            templateTasks: clonedTasks,
            organizationId: orgId,
            createdBy: userId,
            isArchived: false,
        });

        await clone.save();
        await clone.populate('createdBy', 'name');
        
        res.status(201).json({
            data: {
                id: clone._id,
                name: clone.name,
                description: clone.description,
                createdBy: clone.createdBy?.name ?? "Unknown",
                templateTasks: clone.templateTasks,
                updatedAt: clone.updatedAt,
            }
        });

    }catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: 'Failed to clone template'});
    }
}

export async function deleteTemplate(req, res){
    const templateId = req.params.id;
    const orgId = req.organizationId;

    if (!mongoose.Types.ObjectId.isValid(templateId)) {
        console.log("error: Invalid template ID" )
        return res.status(400).json({ error: "Invalid template ID" });
    }

    
    try{
        const template = await Template.findOne({ _id: templateId, organizationId: orgId, deletedAt: null});
        if(!template){
            console.log("Error: Template not found");
            return res.status(404).json({error: "Template not found"});
        }
    
        template.deletedAt = new Date();
        await template.save();
        return res.status(200).json({ data: { message: "Template deleted successfully" } })
    }catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: 'Failed to delete template'});
    }

}
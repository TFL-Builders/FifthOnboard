import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Template from '../models/template.js'
import User from '../models/user.js' 

dotenv.config()

const testTemplate = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/columbus")
        console.log('MongoDB Connected')

        const orgId = '6a1acc61bee1030094da295d'
        const userId = "6a1acc61bee1030094da295e"

        // test 1: create a valid template with tasks
       const template = await Template.create({
    organizationId: orgId,
    createdBy: userId,
    name: "Engineering Onboarding",
    description: "A standard onboarding plan for new engineers — covers account provisioning, environment setup, first contributions, and 30/60/90-day check-ins.",
    templateTasks: [
        {
            title: "Provision laptop and peripherals",
            assigneeDepartment: "it",
            phase: "pre_start",
            dueOffsetDays: -5,
            order: 0,
            requiresUpload: false,
        },
        {
            title: "Create company email and SSO account",
            assigneeDepartment: "it",
            phase: "pre_start",
            dueOffsetDays: -3,
            order: 1,
            requiresUpload: false,
        },
        {
            title: "Add to GitHub, Slack, and 1Password",
            assigneeDepartment: "it",
            phase: "pre_start",
            dueOffsetDays: -3,
            order: 2,
            requiresUpload: false,
        },
        {
            title: "Send welcome packet and first-day logistics",
            assigneeDepartment: "hr",
            phase: "pre_start",
            dueOffsetDays: -3,
            order: 3,
            requiresUpload: false,
        },
        {
            title: "Assign onboarding buddy",
            assigneeDepartment: "manager",
            phase: "pre_start",
            dueOffsetDays: -2,
            order: 4,
            requiresUpload: false,
        },
        {
            title: "Prepare first-week schedule and intro meetings",
            assigneeDepartment: "manager",
            phase: "pre_start",
            dueOffsetDays: -1,
            order: 5,
            requiresUpload: false,
        },
        {
            title: "Sign employment contract and NDA",
            assigneeDepartment: "new_hire",
            phase: "week_1",
            dueOffsetDays: 0,
            order: 0,
            requiresUpload: true,
        },
        {
            title: "Submit tax and ID documents",
            assigneeDepartment: "new_hire",
            phase: "week_1",
            dueOffsetDays: 0,
            order: 1,
            requiresUpload: true,
        },
        {
            title: "HR orientation and company overview",
            assigneeDepartment: "hr",
            phase: "week_1",
            dueOffsetDays: 0,
            order: 2,
            requiresUpload: false,
        },
        {
            title: "First 1:1 with manager",
            assigneeDepartment: "manager",
            phase: "week_1",
            dueOffsetDays: 0,
            order: 3,
            requiresUpload: false,
        },
        {
            title: "Set up local development environment",
            assigneeDepartment: "new_hire",
            phase: "week_1",
            dueOffsetDays: 1,
            order: 4,
            requiresUpload: false,
        },
        {
            title: "Read the engineering handbook",
            assigneeDepartment: "new_hire",
            phase: "week_1",
            dueOffsetDays: 2,
            order: 5,
            requiresUpload: false,
        },
        {
            title: "Complete security and compliance training",
            assigneeDepartment: "new_hire",
            phase: "week_1",
            dueOffsetDays: 3,
            order: 6,
            requiresUpload: true,
        },
        {
            title: "Open and merge a first PR (README or starter task)",
            assigneeDepartment: "new_hire",
            phase: "week_1",
            dueOffsetDays: 5,
            order: 7,
            requiresUpload: false,
        },
        {
            title: "Pair with a teammate on an open ticket",
            assigneeDepartment: "new_hire",
            phase: "week_2",
            dueOffsetDays: 7,
            order: 0,
            requiresUpload: false,
        },
        {
            title: "Ship first independent change to production",
            assigneeDepartment: "new_hire",
            phase: "week_2",
            dueOffsetDays: 12,
            order: 1,
            requiresUpload: false,
        },
        {
            title: "Enroll in benefits and retirement plan",
            assigneeDepartment: "new_hire",
            phase: "week_2",
            dueOffsetDays: 14,
            order: 2,
            requiresUpload: true,
        },
        {
            title: "Week-2 check-in with manager",
            assigneeDepartment: "manager",
            phase: "week_2",
            dueOffsetDays: 14,
            order: 3,
            requiresUpload: false,
        },
        {
            title: "Present a short demo or learning to the team",
            assigneeDepartment: "new_hire",
            phase: "week_3_plus",
            dueOffsetDays: 21,
            order: 0,
            requiresUpload: false,
        },
        {
            title: "30-day review and goal-setting",
            assigneeDepartment: "manager",
            phase: "week_3_plus",
            dueOffsetDays: 30,
            order: 1,
            requiresUpload: false,
        },
        {
            title: "30-day HR check-in",
            assigneeDepartment: "hr",
            phase: "week_3_plus",
            dueOffsetDays: 30,
            order: 2,
            requiresUpload: false,
        },
        {
            title: "60-day progress review",
            assigneeDepartment: "manager",
            phase: "week_3_plus",
            dueOffsetDays: 60,
            order: 3,
            requiresUpload: false,
        },
        {
            title: "90-day performance review",
            assigneeDepartment: "manager",
            phase: "week_3_plus",
            dueOffsetDays: 90,
            order: 4,
            requiresUpload: false,
        },
    ]
});
        console.log('✓ Template created:', template.name)
        console.log('✓ Tasks created:', template.templateTasks.length)


        const newTemplate = await Template
               .findById(template._id)
               .select('name description createdBy templateTasks updatedAt')
               .populate('createdBy', 'name');

               console.log(newTemplate)

        // clean up
       
        console.log('✓ Test documents cleaned up')

    } catch (error) {
        console.error('Test failed:', error.message)
    } finally {
        mongoose.disconnect()
    }
}

testTemplate()
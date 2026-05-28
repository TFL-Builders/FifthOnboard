import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Template from '../models/template.js'
import User from '../models/user.js' 

dotenv.config()

const testTemplate = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/columbus")
        console.log('MongoDB Connected')

        const orgId = '6a16ba953d67652c11a584d4'
        const userId = "6a158a6cd2d4be614722f35e";

        // test 1: create a valid template with tasks
        const template = await Template.create({
            organizationId: orgId,
            name: 'Standard Onboarding',
            description: 'Default onboarding template for new hires',
            createdBy: userId,
            templateTasks: [
                {
                    title: 'Set up laptop',
                    assigneeRole: 'it',
                    dueOffsetDays: -3,
                    phase: 'pre_start',
                    order: 0,
                    requiresUpload: false
                },
                {
                    title: 'Sign contracts',
                    assigneeRole: 'hr',
                    dueOffsetDays: 0,
                    phase: 'week_1',
                    order: 1,
                    requiresUpload: true
                }
            ]
        })
        console.log('✓ Template created:', template.name)
        console.log('✓ Tasks created:', template.templateTasks.length)

    
        await Template.create({
            organizationId: orgId,
            name: 'Balls Onboarding',
            createdBy: userId,
            templateTasks: [{
                title: 'Set up balls',
                assigneeRole: 'custom',
                dueOffsetDays: -4,
                phase: 'week_1',
                order: 0,
                requiresUpload: false
            },
            {
                title: 'Sign balls',
                assigneeRole: 'hr',
                dueOffsetDays: 1,
                phase: 'week_2',
                order: 1,
                requiredUpload: true
            }
        ]
        })
        

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
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Template from '../models/template.js'

dotenv.config()

const testTemplate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('MongoDB Connected')

        const orgId = new mongoose.Types.ObjectId()
        const userId = new mongoose.Types.ObjectId()

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

        // test 2: invalid order (float) should fail
        try {
            await Template.create({
                organizationId: orgId,
                name: 'Float Order Test',
                createdBy: userId,
                templateTasks: [
                    {
                        title: 'Bad task',
                        assigneeRole: 'hr',
                        dueOffsetDays: 0,
                        phase: 'week_1',
                        order: 1.5,  // ← should fail
                        requiresUpload: false
                    }
                ]
            })
            console.log('✗ Float order should have failed')
        } catch (err) {
            console.log('✓ Float order correctly rejected:', err.message)
        }

        // test 3: invalid dueOffsetDays (float) should fail
        try {
            await Template.create({
                organizationId: orgId,
                name: 'Float Offset Test',
                createdBy: userId,
                templateTasks: [
                    {
                        title: 'Bad task',
                        assigneeRole: 'hr',
                        dueOffsetDays: 2.5,  // ← should fail
                        phase: 'week_1',
                        order: 0,
                        requiresUpload: false
                    }
                ]
            })
            console.log('✗ Float dueOffsetDays should have failed')
        } catch (err) {
            console.log('✓ Float dueOffsetDays correctly rejected:', err.message)
        }

        // test 4: negative order should fail
        try {
            await Template.create({
                organizationId: orgId,
                name: 'Negative Order Test',
                createdBy: userId,
                templateTasks: [
                    {
                        title: 'Bad task',
                        assigneeRole: 'hr',
                        dueOffsetDays: 0,
                        phase: 'week_1',
                        order: -1,  // ← should fail
                        requiresUpload: false
                    }
                ]
            })
            console.log('✗ Negative order should have failed')
        } catch (err) {
            console.log('✓ Negative order correctly rejected:', err.message)
        }

        // test 5: invalid assigneeRole enum should fail
        try {
            await Template.create({
                organizationId: orgId,
                name: 'Bad Role Test',
                createdBy: userId,
                templateTasks: [
                    {
                        title: 'Bad task',
                        assigneeRole: 'superadmin',  // ← not in enum
                        dueOffsetDays: 0,
                        phase: 'week_1',
                        order: 0,
                        requiresUpload: false
                    }
                ]
            })
            console.log('✗ Invalid role should have failed')
        } catch (err) {
            console.log('✓ Invalid role correctly rejected:', err.message)
        }

        // test 6: missing required name should fail
        try {
            await Template.create({
                organizationId: orgId,
                createdBy: userId
            })
            console.log('✗ Missing name should have failed')
        } catch (err) {
            console.log('✓ Missing name correctly rejected:', err.message)
        }

        // clean up
        await Template.deleteOne({ _id: template._id })
        console.log('✓ Test documents cleaned up')

    } catch (error) {
        console.error('Test failed:', error.message)
    } finally {
        mongoose.disconnect()
    }
}

testTemplate()
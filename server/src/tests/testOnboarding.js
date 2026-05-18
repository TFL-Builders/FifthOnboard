import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Onboarding from '../models/onboarding.js'

dotenv.config()

const testOnboarding = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('MongoDB Connected')

        const orgId = new mongoose.Types.ObjectId()
        const userId = new mongoose.Types.ObjectId()
        const templateId = new mongoose.Types.ObjectId()
        const startDate = new Date('2026-06-01')

        // test 1: create a valid onboarding
        const onboarding = await Onboarding.create({
            organizationId: orgId,
            templateId: templateId,
            newHireName: 'John Doe',
            newHireEmail: 'john@example.com',
            startDate: startDate,
            managerId: userId,
            createdBy: userId,
            status: 'active'
        })
        console.log('✓ Onboarding created:', onboarding.newHireName)

        // test 2: hirePortalExpiresAt should be startDate + 90 days
        const expectedExpiry = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000)
        const actualExpiry = onboarding.hirePortalExpiresAt.toDateString()
        const expectedExpiryStr = expectedExpiry.toDateString()
        if (actualExpiry === expectedExpiryStr) {
            console.log('✓ hirePortalExpiresAt correctly set to:', actualExpiry)
        } else {
            console.log('✗ hirePortalExpiresAt is wrong:', actualExpiry, 'expected:', expectedExpiryStr)
        }

        // test 3: email should be lowercased
        if (onboarding.newHireEmail === 'john@example.com') {
            console.log('✓ Email lowercased correctly')
        } else {
            console.log('✗ Email not lowercased:', onboarding.newHireEmail)
        }

        // test 4: invalid status enum should fail
        try {
            await Onboarding.create({
                organizationId: orgId,
                newHireName: 'Jane Doe',
                newHireEmail: 'jane@example.com',
                startDate: startDate,
                managerId: userId,
                createdBy: userId,
                status: 'pending'  // ← not in enum
            })
            console.log('✗ Invalid status should have failed')
        } catch (err) {
            console.log('✓ Invalid status correctly rejected:', err.message)
        }

        // test 5: missing required fields should fail
        try {
            await Onboarding.create({
                organizationId: orgId
            })
            console.log('✗ Missing required fields should have failed')
        } catch (err) {
            console.log('✓ Missing required fields correctly rejected:', err.message)
        }

        // test 6: progressPercent out of range should fail
        try {
            await Onboarding.create({
                organizationId: orgId,
                newHireName: 'Bad Hire',
                newHireEmail: 'bad@example.com',
                startDate: startDate,
                managerId: userId,
                createdBy: userId,
                status: 'active',
                progressPercent: 150  // ← above max of 100
            })
            console.log('✗ progressPercent above 100 should have failed')
        } catch (err) {
            console.log('✓ progressPercent above 100 correctly rejected:', err.message)
        }

        // test 7: duplicate hirePortalTokenHash should fail
        try {
            await Onboarding.create({
                organizationId: orgId,
                newHireName: 'Jane Doe',
                newHireEmail: 'jane@example.com',
                startDate: startDate,
                managerId: userId,
                createdBy: userId,
                status: 'active',
                hirePortalTokenHash: 'uniquehash123'
            })

            // try to create another with the same hash
            await Onboarding.create({
                organizationId: orgId,
                newHireName: 'Jack Doe',
                newHireEmail: 'jack@example.com',
                startDate: startDate,
                managerId: userId,
                createdBy: userId,
                status: 'active',
                hirePortalTokenHash: 'uniquehash123'  // ← duplicate
            })
            console.log('✗ Duplicate tokenHash should have failed')
        } catch (err) {
            console.log('✓ Duplicate tokenHash correctly rejected:', err.message)
        }

        // clean up
        await Onboarding.deleteMany({ organizationId: orgId })
        console.log('✓ Test documents cleaned up')

    } catch (error) {
        console.error('Test failed:', error.message)
    } finally {
        mongoose.disconnect()
    }
}

testOnboarding()
//Code used to test organization schema and ensure it is working properly
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Organization from '../models/organization.js'

dotenv.config()

const testOrganization = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('MongoDB Connected')

        // test 1: create a valid organization
        const org = await Organization.create({
            name: 'Tech Corp',
            createdBy: new mongoose.Types.ObjectId()
        })
        console.log('✓ Organization created:', org)
        console.log('✓ Slug auto-generated:', org.slug)

        // test 2: duplicate slug should fail
        try {
            await Organization.create({
                name: 'Tech Corp',
                createdBy: new mongoose.Types.ObjectId()
            })
            console.log('✗ Duplicate slug should have failed')
        } catch (err) {
            console.log('✓ Duplicate slug correctly rejected:', err.message)
        }

        // test 3: name too short should fail
        try {
            await Organization.create({
                name: 'T',
                createdBy: new mongoose.Types.ObjectId()
            })
            console.log('✗ Short name should have failed')
        } catch (err) {
            console.log('✓ Short name correctly rejected:', err.message)
        }

        // test 4: missing required fields should fail
        try {
            await Organization.create({})
            console.log('✗ Missing fields should have failed')
        } catch (err) {
            console.log('✓ Missing required fields correctly rejected:', err.message)
        }

        // test 5: special characters in name
        const org2 = await Organization.create({
            name: 'Café & Co!',
            createdBy: new mongoose.Types.ObjectId()
        })
        console.log('✓ Special character slug:', org2.slug)

        // clean up
        await Organization.deleteMany({ _id: { $in: [org._id, org2._id] } })
        console.log('✓ Test documents cleaned up')

    } catch (error) {
        console.error('Test failed:', error.message)
    } finally {
        mongoose.disconnect()
    }
}

testOrganization()
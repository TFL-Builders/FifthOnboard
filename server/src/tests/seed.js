import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

// ==========================================
// 1. CONSTANTS (Matching your configuration)
// ==========================================
const DEPARTMENTS = ["hr", "manager", "it", "finance", "custom", 'new_hire'];
const ASSIGNEE_DEPARTMENTS = ["hr", "manager", "it", "finance", "custom"];
const ONBOARDING_STATUSES = ["active", "completed", "archived", "cancelled"];
const TASK_STATUSES = ["pending", "in_progress", "done", "blocked"];
const USER_ROLES = ["admin", "hr", "manager", "employee", "task_owner"];
const PHASES = ["pre_start", "week_1", "week_2", "week_3_plus"];
const USER_STATUSES = ['active', 'pending', 'invited', 'disabled'];

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/onboarding_dev";
const DEFAULT_PASSWORD = "Password123!";

// ==========================================
// 2. INLINED SCHEMAS (Self-contained)
// ==========================================
const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    defaultDepartmentMap: { type: Map, of: String },
    defaultManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    name: { type: String, required: true },
    role: { type: String, enum: USER_ROLES },
    avatarColor: { type: String },
    status: { type: String, enum: USER_STATUSES },
    department: { type: String, enum: DEPARTMENTS, default: null },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

const onboardingSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    templateId: { type: mongoose.Schema.Types.ObjectId },
    templateName: { type: String, default: null },
    newHireName: { type: String, required: true },
    job: { type: String, default: null },
    newHireEmail: { type: String, required: true, lowercase: true, trim: true },
    startDate: { type: Date, required: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ONBOARDING_STATUSES, default: 'active' },
    warnings: {
        hasUnassignedTasks: { type: Boolean, default: false },
        hasNoManager: { type: Boolean, default: false }
    },
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    newHireProgressPercent: { type: Number, default: 0, min: 0, max: 100 },
    hirePortalTokenHash: { type: String },
    hirePortalExpiresAt: { type: Date },
    completedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

const attachmentSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    url: { type: String, required: true },
    uploadedByNewHire: { type: mongoose.Schema.Types.ObjectId, ref: 'Onboarding' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    onboardingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Onboarding', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    assigneeUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assigneeDepartment: { type: String, enum: DEPARTMENTS },
    dueAt: { type: Date },
    phase: { type: String, enum: PHASES },
    status: { type: String, enum: TASK_STATUSES, default: 'pending' },
    blockedReason: { type: String },
    completedAt: { type: Date, default: null },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    requiresUpload: { type: Boolean, default: false },
    attachments: [attachmentSchema],
    order: { type: Number, min: 0 }
}, { timestamps: true });

// Models definitions
const Organization = mongoose.model('Organization', organizationSchema);
const User = mongoose.model('User', userSchema);
const Onboarding = mongoose.model('Onboarding', onboardingSchema);
const Task = mongoose.model('Task', taskSchema);

// Helper for generating distinct tokens
const generateSecureHash = (prefix) => {
    return `${prefix}_${new mongoose.Types.ObjectId()}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
};

// Helper for dates
const daysFromNow = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
};

// ==========================================
// 3. SEED LOGIC FUNCTION
// ==========================================
async function seedDatabase() {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected! Wiping old static collection configurations...");

        // Wipe existing collections to preserve unique indexes
        await Organization.deleteMany({});
        await User.deleteMany({});
        await Onboarding.deleteMany({});
        await Task.deleteMany({});

        const hashedPassword = await bcryptjs.hash(DEFAULT_PASSWORD, 10);

        // --- ORG 1: ACME CORP ---
        console.log("Creating Organization: Acme Corp...");
        const acmeOrg = await Organization.create({
            name: "Acme Corporation",
            defaultDepartmentMap: { "engineering": "it", "product": "manager" }
        });

        // Create Acme Core Users
        const acmeAdmin = await User.create({
            organizationId: acmeOrg._id,
            email: "admin@acme.com",
            passwordHash: hashedPassword,
            name: "Alice Admin",
            role: "admin",
            status: "active",
            department: "manager"
        });

        const acmeManager = await User.create({
            organizationId: acmeOrg._id,
            email: "manager@acme.com",
            passwordHash: hashedPassword,
            name: "Marcus Manager",
            role: "manager",
            status: "active",
            department: "manager"
        });

        // Link default manager back to org
        acmeOrg.defaultManagerId = acmeManager._id;
        await acmeOrg.save();

        const acmeITGuy = await User.create({
            organizationId: acmeOrg._id,
            email: "it@acme.com",
            passwordHash: hashedPassword,
            name: "Ian IT",
            role: "task_owner",
            status: "active",
            department: "it"
        });

        // --- ORG 2: GLOBEX CORP ---
        console.log("Creating Organization: Globex Corp...");
        const globexOrg = await Organization.create({
            name: "Globex Corporation",
            defaultDepartmentMap: { "sales": "custom" }
        });

        const globexManager = await User.create({
            organizationId: globexOrg._id,
            email: "boss@globex.com",
            passwordHash: hashedPassword,
            name: "Hank Scorpio",
            role: "manager",
            status: "active",
            department: "manager"
        });

        globexOrg.defaultManagerId = globexManager._id;
        await globexOrg.save();

        // --- STATIC BLUEPRINTS FOR TASK SEEDING ---
        const standardTemplateTasks = [
            { title: "Sign Employment Contract", description: "Review and sign the attached legal docs.", phase: "pre_start", assigneeDepartment: "hr", offsetDays: -5 },
            { title: "Set up Laptop & Email credentials", description: "Coordinate with tech support to configure work systems.", phase: "pre_start", assigneeDepartment: "it", offsetDays: -2 },
            { title: "Day 1 Team Intro & Sync", description: "Meet the immediate department team members.", phase: "week_1", assigneeDepartment: "manager", offsetDays: 1 },
            { title: "Complete Compliance Training", description: "Review internal training module material.", phase: "week_2", assigneeDepartment: "custom", offsetDays: 7 },
            { title: "First 30-Day Evaluation Meeting", description: "Sync up on early goals and feedback loop milestones.", phase: "week_3_plus", assigneeDepartment: "manager", offsetDays: 30 }
        ];

        // --- SEED ONBOARDINGS & TASKS ---
        console.log("Seeding Onboardings pipelines...");

        // Pipeline 1: Acme Corp Active Hire
        const onboarding1 = await Onboarding.create({
            organizationId: acmeOrg._id,
            templateName: "Standard Engineering Path",
            newHireName: "John Doe",
            job: "Software Engineer",
            newHireEmail: "john.doe@gmail.com",
            startDate: daysFromNow(5),
            managerId: acmeManager._id,
            createdBy: acmeAdmin._id,
            status: "active",
            progressPercent: 20,
            newHireProgressPercent: 0,
            warnings: { hasUnassignedTasks: false, hasNoManager: false },
            hirePortalTokenHash: generateSecureHash("hpt"),
            hirePortalExpiresAt: daysFromNow(95)
        });

        // Add Tasks for Pipeline 1
        for (let i = 0; i < standardTemplateTasks.length; i++) {
            const blueprint = standardTemplateTasks[i];
            let assignedUser = null;
            
            // Assign users matching specific corporate department groups
            if (blueprint.assigneeDepartment === "it") assignedUser = acmeITGuy._id;
            if (blueprint.assigneeDepartment === "manager") assignedUser = acmeManager._id;

            await Task.create({
                organizationId: acmeOrg._id,
                onboardingId: onboarding1._id,
                title: blueprint.title,
                description: blueprint.description,
                assigneeUserId: assignedUser,
                assigneeDepartment: blueprint.assigneeDepartment,
                dueAt: daysFromNow(blueprint.offsetDays),
                phase: blueprint.phase,
                status: i === 0 ? "done" : i === 3 ? "blocked" : "pending",
                blockedReason: i === 3 ? "Awaiting training system credentials validation link." : null,
                order: i,
                completedAt: i === 0 ? daysFromNow(-4) : null,
                completedBy: i === 0 ? acmeAdmin._id : null
            });
        }

        // Pipeline 2: Globex Corp Completed Hire
        const onboarding2 = await Onboarding.create({
            organizationId: globexOrg._id,
            templateName: "Standard Exec Path",
            newHireName: "Jane Smith",
            job: "Operations Lead",
            newHireEmail: "jane.smith@yahoo.com",
            startDate: daysFromNow(-45),
            managerId: globexManager._id,
            createdBy: globexManager._id,
            status: "completed",
            progressPercent: 100,
            newHireProgressPercent: 100,
            warnings: { hasUnassignedTasks: false, hasNoManager: false },
            hirePortalTokenHash: generateSecureHash("hpt"),
            hirePortalExpiresAt: daysFromNow(45),
            completedAt: daysFromNow(-1)
        });

        // Add tasks for Pipeline 2 (All marked completed)
        for (let i = 0; i < standardTemplateTasks.length; i++) {
            const blueprint = standardTemplateTasks[i];
            await Task.create({
                organizationId: globexOrg._id,
                onboardingId: onboarding2._id,
                title: blueprint.title,
                description: blueprint.description,
                assigneeUserId: globexManager._id,
                assigneeDepartment: blueprint.assigneeDepartment,
                dueAt: daysFromNow(blueprint.offsetDays - 45),
                phase: blueprint.phase,
                status: "done",
                order: i,
                completedAt: daysFromNow(-15),
                completedBy: globexManager._id
            });
        }

        console.log("\n=============================================");
        console.log(" 🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY! ");
        console.log("=============================================");
        console.log(` Organizations created : 2`);
        console.log(` Core Admin/Managers    : 4`);
        console.log(` Onboarding Pipelines   : 2`);
        console.log(` Total Pipeline Tasks   : 10`);
        console.log("=============================================");
        console.log("Demo Credentials Available:");
        console.log(" -> Acme Admin   : admin@acme.com / Password123!");
        console.log(" -> Acme Manager : manager@acme.com / Password123!");
        console.log(" -> Globex Boss  : boss@globex.com / Password123!");
        console.log("=============================================\n");

    } catch (error) {
        console.error("❌ Fatal Error during seeding run:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Database connection terminated.");
    }
}

// Execute running hook
seedDatabase();
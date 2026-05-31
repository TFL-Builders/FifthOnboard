import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import slugify from 'slugify';
import AuditLog from '../models/AuditLog.js';
import Comment from '../models/Comment.js';
import Invite from '../models/Invite.js';
import Notification from '../models/Notification.js'
import Onboarding from '../models/Onboarding.js';
import Organization from '../models/Organization.js';
import RefreshToken from '../models/RefreshToken.js';
import Task from '../models/Task.js';
import Template from '../models/Template.js';
import User from '../models/User.js';


const pick       = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt    = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysFrom   = (base, n) => new Date(base.getTime() + n * 24 * 60 * 60 * 1000);
const daysFromNow = (n) => daysFrom(new Date(), n);
 
const AVATAR_COLORS = ['#F87171', '#FB923C', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6', '#2DD4BF'];
 
 
// ─── Static Data Definitions ──────────────────────────────────────────────────
const ORG_DEFS = [
  { name: 'Acme Corp',       accentColor: '#6366F1', slug: 'acme-corp'      },
  { name: 'Globex Inc',      accentColor: '#10B981', slug: 'globex-inc'     },
  { name: 'Initech LLC',     accentColor: '#F59E0B', slug: 'initech-llc'    },
  { name: 'Umbrella Ltd',    accentColor: '#EF4444', slug: 'umbrella-ltd'   },
  { name: 'Hooli Solutions', accentColor: '#8B5CF6', slug: 'hooli-solutions' }
];
 

// One set of users per org — seeded with deterministic emails
const USER_DEFS = [
  { role: 'admin',      name: 'Alex Admin',    suffix: 'alex.admin'    },
  { role: 'hr',         name: 'Hannah HR',     suffix: 'hannah.hr'     },
  { role: 'manager',    name: 'Mike Manager',  suffix: 'mike.manager'  },
  { role: 'manager',    name: 'Fiona Field',   suffix: 'fiona.field'   },
  { role: 'employee',   name: 'Sam Stone',     suffix: 'sam.stone'     },
  { role: 'employee',   name: 'Lily Lane',     suffix: 'lily.lane'     },
  { role: 'employee',   name: 'Tom Torres',    suffix: 'tom.torres'    },
  { role: 'task_owner', name: 'Owen Owner',    suffix: 'owen.owner'    }
];
 
// Reusable template task blueprints
const TEMPLATE_TASK_BLUEPRINTS = {
  standard: [
    { title: 'Send welcome email',           assigneeRole: 'hr',       phase: 'pre_start',   dueOffsetDays: -3, order: 1, requiresUpload: false, description: 'Send the new hire a welcome email with first-day instructions.' },
    { title: 'Prepare workstation',          assigneeRole: 'it',       phase: 'pre_start',   dueOffsetDays: -1, order: 2, requiresUpload: false, description: 'Set up laptop, peripherals, and necessary software.' },
    { title: 'Complete I-9 verification',    assigneeRole: 'new_hire', phase: 'pre_start',   dueOffsetDays: 0,  order: 3, requiresUpload: true,  description: 'Upload government-issued ID and complete the I-9 form.' },
    { title: 'Attend orientation session',   assigneeRole: 'new_hire', phase: 'week_1',      dueOffsetDays: 1,  order: 4, requiresUpload: false, description: 'Attend the company-wide orientation on Day 1.' },
    { title: 'Set up payroll direct deposit',assigneeRole: 'hr',       phase: 'week_1',      dueOffsetDays: 3,  order: 5, requiresUpload: true,  description: 'Collect banking details and configure payroll.' },
    { title: 'Join Slack workspace',         assigneeRole: 'new_hire', phase: 'week_1',      dueOffsetDays: 1,  order: 6, requiresUpload: false, description: 'Accept Slack invite and join relevant channels.' },
    { title: 'Schedule 1-on-1 with manager', assigneeRole: 'manager',  phase: 'week_1',      dueOffsetDays: 5,  order: 7, requiresUpload: false, description: 'Book first 1-on-1 meeting to set expectations and goals.' },
    { title: 'Complete security training',   assigneeRole: 'new_hire', phase: 'week_2',      dueOffsetDays: 8,  order: 8, requiresUpload: false, description: 'Complete mandatory security and compliance training module.' },
    { title: 'Submit signed NDA',            assigneeRole: 'new_hire', phase: 'week_1',      dueOffsetDays: 2,  order: 9, requiresUpload: true,  description: 'Sign and upload the non-disclosure agreement.' },
    { title: 'Review 30-day goals',          assigneeRole: 'manager',  phase: 'week_3_plus', dueOffsetDays: 21, order: 10, requiresUpload: false, description: 'Review and agree on 30-day performance goals with new hire.' }
  ],
  engineering: [
    { title: 'Send welcome email',           assigneeRole: 'hr',       phase: 'pre_start',   dueOffsetDays: -3, order: 1,  requiresUpload: false, description: 'Send welcome email with engineering team intro.' },
    { title: 'Set up dev environment',       assigneeRole: 'it',       phase: 'pre_start',   dueOffsetDays: -1, order: 2,  requiresUpload: false, description: 'Install required IDEs, tools, and access code repos.' },
    { title: 'Grant repository access',      assigneeRole: 'it',       phase: 'pre_start',   dueOffsetDays: -1, order: 3,  requiresUpload: false, description: 'Add engineer to GitHub org and relevant repos.' },
    { title: 'Complete I-9 verification',    assigneeRole: 'new_hire', phase: 'pre_start',   dueOffsetDays: 0,  order: 4,  requiresUpload: true,  description: 'Upload government-issued ID and complete the I-9 form.' },
    { title: 'Codebase walkthrough',         assigneeRole: 'manager',  phase: 'week_1',      dueOffsetDays: 2,  order: 5,  requiresUpload: false, description: 'Pair session to walk through architecture and core services.' },
    { title: 'Complete security training',   assigneeRole: 'new_hire', phase: 'week_1',      dueOffsetDays: 4,  order: 6,  requiresUpload: false, description: 'Complete mandatory security training for engineers.' },
    { title: 'First PR submitted',           assigneeRole: 'new_hire', phase: 'week_1',      dueOffsetDays: 5,  order: 7,  requiresUpload: false, description: 'Submit first small pull request — bug fix or docs update.' },
    { title: 'Set up payroll direct deposit',assigneeRole: 'hr',       phase: 'week_1',      dueOffsetDays: 3,  order: 8,  requiresUpload: true,  description: 'Collect banking details and configure payroll.' },
    { title: 'Submit signed NDA',            assigneeRole: 'new_hire', phase: 'week_1',      dueOffsetDays: 2,  order: 9,  requiresUpload: true,  description: 'Sign and upload the non-disclosure agreement.' },
    { title: 'On-call schedule review',      assigneeRole: 'manager',  phase: 'week_2',      dueOffsetDays: 10, order: 10, requiresUpload: false, description: 'Review on-call rotation policy and schedule.' },
    { title: 'Set up VPN access',            assigneeRole: 'it',       phase: 'week_1',      dueOffsetDays: 3,  order: 11, requiresUpload: false, description: 'Configure and test VPN for remote access.' },
    { title: 'Review 30-day goals',          assigneeRole: 'manager',  phase: 'week_3_plus', dueOffsetDays: 21, order: 12, requiresUpload: false, description: 'Agree on 30-day delivery goals and ramp milestones.' }
  ],
  sales: [
    { title: 'Send welcome email',           assigneeRole: 'hr',       phase: 'pre_start',   dueOffsetDays: -3, order: 1, requiresUpload: false, description: 'Send welcome email with sales team info and first-week agenda.' },
    { title: 'Complete I-9 verification',    assigneeRole: 'new_hire', phase: 'pre_start',   dueOffsetDays: 0,  order: 2, requiresUpload: true,  description: 'Upload government-issued ID and complete the I-9 form.' },
    { title: 'CRM account setup',            assigneeRole: 'it',       phase: 'pre_start',   dueOffsetDays: -1, order: 3, requiresUpload: false, description: 'Create CRM account and assign territory.' },
    { title: 'Product training — week 1',    assigneeRole: 'new_hire', phase: 'week_1',      dueOffsetDays: 5,  order: 4, requiresUpload: false, description: 'Complete product knowledge training module.' },
    { title: 'Shadow a senior rep',          assigneeRole: 'manager',  phase: 'week_1',      dueOffsetDays: 4,  order: 5, requiresUpload: false, description: 'Arrange for new hire to shadow an experienced sales rep.' },
    { title: 'Set up payroll direct deposit',assigneeRole: 'hr',       phase: 'week_1',      dueOffsetDays: 3,  order: 6, requiresUpload: true,  description: 'Collect banking details and configure payroll.' },
    { title: 'Submit signed NDA',            assigneeRole: 'new_hire', phase: 'week_1',      dueOffsetDays: 2,  order: 7, requiresUpload: true,  description: 'Sign and upload the NDA.' },
    { title: 'First customer call',          assigneeRole: 'new_hire', phase: 'week_2',      dueOffsetDays: 9,  order: 8, requiresUpload: false, description: 'Complete first live customer discovery call.' },
    { title: 'Review commission structure',  assigneeRole: 'hr',       phase: 'week_1',      dueOffsetDays: 3,  order: 9, requiresUpload: false, description: 'Walk through OTE, commission tiers, and quota.' },
    { title: '30-day pipeline review',       assigneeRole: 'manager',  phase: 'week_3_plus', dueOffsetDays: 21, order: 10, requiresUpload: false, description: 'Review initial pipeline and set 90-day quota expectations.' }
  ]
};
 
// New hire definitions — spread evenly across orgs
const NEW_HIRE_DEFS = [
  // Active onboardings (starting soon or just started)
  { name: 'Jordan Lee',      email: 'jordan.lee',     startOffsetDays: 3,   status: 'active',    progress: 0   },
  { name: 'Sam Rivera',      email: 'sam.rivera',     startOffsetDays: 0,   status: 'active',    progress: 15  },
  { name: 'Morgan Hayes',    email: 'morgan.hayes',   startOffsetDays: -5,  status: 'active',    progress: 35  },
  { name: 'Taylor Brooks',   email: 'taylor.brooks',  startOffsetDays: -10, status: 'active',    progress: 55  },
  { name: 'Casey Kim',       email: 'casey.kim',      startOffsetDays: -3,  status: 'active',    progress: 20  },
  // Completed onboardings
  { name: 'Dana Flores',     email: 'dana.flores',    startOffsetDays: -60, status: 'completed', progress: 100 },
  { name: 'Riley Nguyen',    email: 'riley.nguyen',   startOffsetDays: -45, status: 'completed', progress: 100 },
  { name: 'Quinn Patel',     email: 'quinn.patel',    startOffsetDays: -90, status: 'completed', progress: 100 },
  // Archived / cancelled
  { name: 'Drew Callahan',   email: 'drew.callahan',  startOffsetDays: -30, status: 'archived',  progress: 40  },
  { name: 'Avery Simmons',   email: 'avery.simmons',  startOffsetDays: -20, status: 'cancelled', progress: 10  }
];

const COMMENT_BODIES = [
  'Just finished this — all good!',
  'Blocked waiting on IT to provision access.',
  'Can someone clarify what needs to be uploaded here?',
  'Done, please review and verify.',
  'Uploaded the signed copy to attachments.',
  'Manager approval still pending.',
  'Completed ahead of schedule 🎉',
  'Running behind, will finish by EOD.',
  'Reached out to HR — awaiting response.',
  'Left a note in Slack too.',
  'This needs to be done before the next step can start.',
  'Done. Confirmed with the new hire directly.'
];
 
 
// ─── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/onboarding_dev';
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected:', MONGO_URI);
 
  // Wipe only the collections we own — leave RefreshTokens and Invites alone
  await Promise.all([
    Organization.deleteMany({}),
    User.deleteMany({}),
    Template.deleteMany({}),
    Onboarding.deleteMany({}),
    Task.deleteMany({}),
    Comment.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({})
  ]);
  console.log('🗑   Cleared static collections (tokens & invites untouched)');
 
  const passwordHash = await bcryptjs.hash('Password123!', 10);
 
  // ── 1. Organizations ──────────────────────────────────────────────────────
  const orgs = await Organization.insertMany(ORG_DEFS.map(o => ({
    ...o,
    logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(o.name)}&background=${o.accentColor.slice(1)}&color=fff`
  })));
  console.log(`🏢  Created ${orgs.length} organizations`);
 
  // ── 2. Users ───────────────────────────────────────────────────────────────
  const allUsers = [];
  for (const org of orgs) {
    const orgUsers = await User.insertMany(USER_DEFS.map(u => ({
      organizationId:  org._id,
      email:           `${u.suffix}@mail.com`,
      passwordHash,
      name:            `${u.name}`,
      role:            u.role,
      avatarColor:     pick(AVATAR_COLORS),
      status:          'active',
      emailVerifiedAt: new Date(),
      lastLoginAt:     daysFromNow(-randInt(0, 14)),
      theme:           pick(['dark', 'light', null])
    })));
 
    // Point org.createdBy at the admin
    const admin = orgUsers.find(u => u.role === 'admin');
    await Organization.findByIdAndUpdate(org._id, { createdBy: admin._id });
 
    allUsers.push(...orgUsers);
  }
  console.log(`👤  Created ${allUsers.length} users`);
 
  // ── 3. Templates (3 per org — standard, engineering, sales) ───────────────
  const allTemplates = [];
  const TEMPLATE_DEFS = [
    { name: 'Standard Onboarding',     description: 'Default onboarding flow for all new hires.',          tasks: 'standard'    },
    { name: 'Engineering Onboarding',  description: 'Extended onboarding track for engineering new hires.', tasks: 'engineering' },
    { name: 'Sales Onboarding',        description: 'Sales-specific onboarding with CRM and product ramp.', tasks: 'sales'       }
  ];
 
  for (const org of orgs) {
    const admin = allUsers.find(u => u.organizationId.equals(org._id) && u.role === 'admin');
 
    for (const def of TEMPLATE_DEFS) {
      const t = new Template({
        organizationId: org._id,
        name:           def.name,
        description:    def.description,
        createdBy:      admin._id,
        templateTasks:  TEMPLATE_TASK_BLUEPRINTS[def.tasks]
      });
      await t.save();
      allTemplates.push(t);
    }
  }
  console.log(`📋  Created ${allTemplates.length} templates`);
 
  // ── 4. Onboardings ─────────────────────────────────────────────────────────
  // Distribute new hires across orgs (2 per org)
  const allOnboardings = [];
  const TEMPLATE_KEYS = ['standard', 'engineering', 'sales'];
 
  for (let orgIdx = 0; orgIdx < orgs.length; orgIdx++) {
    const org      = orgs[orgIdx];
    const orgUsers = allUsers.filter(u => u.organizationId.equals(org._id));
    const managers = orgUsers.filter(u => u.role === 'manager');
    const hr       = orgUsers.find(u => u.role === 'hr');
    const orgTemplates = allTemplates.filter(t => t.organizationId.equals(org._id));
 
    // Assign 2 new hires per org, cycling through the NEW_HIRE_DEFS array
    const hireSlice = NEW_HIRE_DEFS.slice(orgIdx * 2, orgIdx * 2 + 2);
 
    for (let i = 0; i < hireSlice.length; i++) {
      const hire       = hireSlice[i];
      const startDate  = daysFromNow(hire.startOffsetDays);
      const template   = orgTemplates[i % orgTemplates.length];
      const manager    = managers[i % managers.length];
      const isComplete = hire.status === 'completed';
 
      const ob = await Onboarding.create({
        organizationId:      org._id,
        templateId:          template._id,
        newHireName:         hire.name,
        newHireEmail:        `${hire.email}@${org.slug}.dev`,
        startDate,
        managerId:           manager._id,
        createdBy:           hr._id,
        status:              hire.status,
        progressPercent:     hire.progress,
        completedAt:         isComplete ? daysFromNow(hire.startOffsetDays + 60) : null,
        hirePortalTokenHash: `hpt_${org._id}_${i}_${Date.now()}_${Math.random().toString(36).slice(2)}`
      });
      allOnboardings.push(ob);
    }
  }
  console.log(`🚀  Created ${allOnboardings.length} onboardings`);
 
  // ── 5. Tasks ───────────────────────────────────────────────────────────────
  // For each onboarding, generate tasks from its template's blueprints
  const allTasks = [];
 
  for (const ob of allOnboardings) {
    const orgUsers   = allUsers.filter(u => u.organizationId.equals(ob.organizationId));
    const manager    = orgUsers.find(u => u.role === 'manager');
    const hr         = orgUsers.find(u => u.role === 'hr');
    const it         = orgUsers.find(u => u.role === 'task_owner');
    const employees  = orgUsers.filter(u => u.role === 'employee');
 
    // Map assigneeRole → a real user
    const roleToUser = {
      hr:       hr,
      manager:  manager,
      it:       it,
      finance:  pick(employees),
      new_hire: null,   // no portal user — leave null
      custom:   pick(employees)
    };
 
    // Find the right blueprint set from the template name
    const template = allTemplates.find(t => t._id.equals(ob.templateId));
    const blueprintKey = template.name.toLowerCase().includes('eng') ? 'engineering'
                       : template.name.toLowerCase().includes('sal') ? 'sales'
                       : 'standard';
    const blueprints = TEMPLATE_TASK_BLUEPRINTS[blueprintKey];
 
    for (const bp of blueprints) {
      const assignee = roleToUser[bp.assigneeRole] ?? null;
      const dueAt    = daysFrom(ob.startDate, bp.dueOffsetDays);
 
      // Derive a realistic status based on onboarding progress and due date
      let status = 'pending';
      if (ob.status === 'completed') {
        status = 'done';
      } else if (ob.status === 'cancelled') {
        status = 'pending';
      } else {
        const isPast = dueAt < new Date();
        if (isPast) {
          status = pick(['done', 'done', 'blocked', 'in_progress']); // weight toward done
        } else {
          status = pick(['pending', 'pending', 'in_progress']);
        }
      }
 
      const isDone    = status === 'done';
      const isBlocked = status === 'blocked';
 
      const task = await Task.create({
        organizationId: ob.organizationId,
        onboardingId:   ob._id,
        title:          bp.title,
        description:    bp.description,
        assigneeUserId: assignee?._id ?? null,
        assigneeRole:   bp.assigneeRole,
        dueAt,
        phase:          bp.phase,
        status,
        blockedReason:  isBlocked ? 'Waiting on a response from a third-party provider.' : undefined,
        completedAt:    isDone ? daysFrom(dueAt, -randInt(0, 2)) : null,
        completedBy:    isDone && assignee ? assignee._id : null,
        requiresUpload: bp.requiresUpload,
        order:          bp.order
      });
      allTasks.push(task);
    }
  }
  console.log(`✅  Created ${allTasks.length} tasks`);
 
  // ── 6. Comments (on ~60% of tasks, 1–2 each) ──────────────────────────────
  const allComments = [];
  for (const task of allTasks) {
    if (Math.random() > 0.6) continue;   // skip 40% of tasks
    const orgUsers    = allUsers.filter(u => u.organizationId.equals(task.organizationId));
    const numComments = randInt(1, 2);
    for (let i = 0; i < numComments; i++) {
      const author = pick(orgUsers);
      allComments.push(await Comment.create({
        organizationId:    task.organizationId,
        taskId:            task._id,
        authorId:          author._id,
        authorDisplayName: author.name,
        body:              pick(COMMENT_BODIES)
      }));
    }
  }
  console.log(`💬  Created ${allComments.length} comments`);
 
  // ── 7. Notifications (per user, tied to real tasks/onboardings) ────────────
  const notifDocs = [];
  for (const user of allUsers) {
    const userTasks    = allTasks.filter(t => t.assigneeUserId?.equals(user._id));
    const orgOnboarding = allOnboardings.filter(o => o.organizationId.equals(user.organizationId));
 
    // task_assigned: one per assigned task (up to 3)
    for (const task of userTasks.slice(0, 3)) {
      notifDocs.push({
        organizationId: user.organizationId,
        userId:         user._id,
        type:           'task_assigned',
        title:          'New task assigned to you',
        body:           `You've been assigned: "${task.title}"`,
        link:           `/onboardings/${task.onboardingId}/tasks/${task._id}`,
        readAt:         Math.random() < 0.5 ? daysFromNow(-randInt(1, 7)) : null
      });
    }
 
    // task_due_soon: for tasks due in next 3 days
    const dueSoon = userTasks.filter(t => {
      const diff = (t.dueAt - new Date()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 3 && t.status !== 'done';
    });
    for (const task of dueSoon) {
      notifDocs.push({
        organizationId: user.organizationId,
        userId:         user._id,
        type:           'task_due_soon',
        title:          'Task due soon',
        body:           `"${task.title}" is due within 3 days.`,
        link:           `/onboardings/${task.onboardingId}/tasks/${task._id}`,
        readAt:         null
      });
    }
 
    // onboarding_completed: for managers/HR on completed onboardings
    if (['manager', 'hr', 'admin'].includes(user.role)) {
      const completed = orgOnboarding.filter(o => o.status === 'completed');
      for (const ob of completed.slice(0, 2)) {
        notifDocs.push({
          organizationId: user.organizationId,
          userId:         user._id,
          type:           'onboarding_completed',
          title:          'Onboarding completed',
          body:           `${ob.newHireName}'s onboarding has been completed.`,
          link:           `/onboardings/${ob._id}`,
          readAt:         daysFromNow(-randInt(1, 10))
        });
      }
    }
  }
  await Notification.insertMany(notifDocs);
  console.log(`🔔  Created ${notifDocs.length} notifications`);
 
  // ── 8. Audit Logs ──────────────────────────────────────────────────────────
  const auditDocs = [];
 
  for (const ob of allOnboardings) {
    const orgUsers = allUsers.filter(u => u.organizationId.equals(ob.organizationId));
    const hr       = orgUsers.find(u => u.role === 'hr');
    const manager  = orgUsers.find(u => u.role === 'manager');
 
    // onboarding.created
    auditDocs.push({
      organizationId: ob.organizationId,
      onboardingId:   ob._id,
      actorId:        hr._id,
      actorLabel:     hr.name,
      action:         'onboarding.created',
      targetType:     'onboarding',
      targetId:       ob._id,
      metadata:       { newHireName: ob.newHireName, newHireEmail: ob.newHireEmail },
      createdAt: daysFrom(ob.startDate, -5)
    });
 
    // task.assigned — one log per task
    const obTasks = allTasks.filter(t => t.onboardingId.equals(ob._id));
    for (const task of obTasks) {
      auditDocs.push({
        organizationId: ob.organizationId,
        onboardingId:   ob._id,
        actorId:        manager._id,
        actorLabel:     manager.name,
        action:         'task.assigned',
        targetType:     'task',
        targetId:       task._id,
        metadata:       { taskTitle: task.title, assigneeRole: task.assigneeRole },
        createdAt:      daysFromNow(-randInt(1, 30))
      });
    }
 
    // task.completed — for done tasks
    for (const task of obTasks.filter(t => t.status === 'done')) {
      auditDocs.push({
        organizationId: ob.organizationId,
        onboardingId:   ob._id,
        actorId:        task.completedBy ?? manager._id,
        actorLabel:     orgUsers.find(u => u._id.equals(task.completedBy ?? manager._id))?.name ?? manager.name,
        action:         'task.completed',
        targetType:     'task',
        targetId:       task._id,
        metadata:       { taskTitle: task.title },
        createdAt:      task.completedAt ?? daysFromNow(-randInt(1, 10))
      });
    }
 
    // task.blocked — for blocked tasks
    for (const task of obTasks.filter(t => t.status === 'blocked')) {
      auditDocs.push({
        organizationId: ob.organizationId,
        onboardingId:   ob._id,
        actorId:        manager._id,
        actorLabel:     manager.name,
        action:         'task.blocked',
        targetType:     'task',
        targetId:       task._id,
        metadata:       { reason: task.blockedReason },
        createdAt:      daysFromNow(-randInt(1, 7))
      });
    }
 
    // comment.added — one per comment on this onboarding's tasks
    const obComments = allComments.filter(c =>
      obTasks.some(t => t._id.equals(c.taskId))
    );
    for (const comment of obComments) {
      auditDocs.push({
        organizationId: ob.organizationId,
        onboardingId:   ob._id,
        actorId:        comment.authorId,
        actorLabel:     comment.authorDisplayName,
        action:         'comment.added',
        targetType:     'comment',
        targetId:       comment._id,
        metadata:       { taskId: comment.taskId },
        createdAt:      comment.createdAt
      });
    }
 
    // onboarding completed event
    if (ob.status === 'completed') {
      auditDocs.push({
        organizationId: ob.organizationId,
        onboardingId:   ob._id,
        actorId:        hr._id,
        actorLabel:     hr.name,
        action:         'onboarding.created', // closest available action
        targetType:     'onboarding',
        targetId:       ob._id,
        metadata:       { event: 'onboarding_marked_complete', completedAt: ob.completedAt },
        createdAt:      ob.completedAt ?? new Date()
      });
    }
  }
 
  // template.created — one per template
  for (const t of allTemplates) {
    const admin = allUsers.find(u => u.organizationId.equals(t.organizationId) && u.role === 'admin');
    auditDocs.push({
      organizationId: t.organizationId,
      actorId:        admin._id,
      actorLabel:     admin.name,
      action:         'template.created',
      targetType:     'template',
      targetId:       t._id,
      metadata:       { templateName: t.name },
      createdAt:      t.createdAt
    });
  }
 
  await AuditLog.insertMany(auditDocs);
  console.log(`📜  Created ${auditDocs.length} audit logs`);
 
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n🎉  Seed complete!\n');
  console.log(`    Organizations : ${orgs.length}`);
  console.log(`    Users         : ${allUsers.length}  (${USER_DEFS.length} roles × ${orgs.length} orgs)`);
  console.log(`    Templates     : ${allTemplates.length} (3 per org — standard / engineering / sales)`);
  console.log(`    Onboardings   : ${allOnboardings.length}`);
  console.log(`    Tasks         : ${allTasks.length}`);
  console.log(`    Comments      : ${allComments.length}`);
  console.log(`    Notifications : ${notifDocs.length}`);
  console.log(`    Audit logs    : ${auditDocs.length}`);
  console.log('\n🔐  All users password : Password123!');
  console.log('📧  Email format       : <role>@<org-slug>.dev  e.g. hannah.hr@acme-corp.dev\n');
 
  await mongoose.disconnect();
}
 
seed().catch(err => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});

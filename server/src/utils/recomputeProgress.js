import Onboarding from "../models/Onboarding.js";
import Task from "../models/Task.js";

export async function recomputeProgress(onboardingId) {
    console.log("RECOMPUTE FUNCTION RUNNING");
    const [total, done, onboarding] = await Promise.all([
        Task.countDocuments({ onboardingId }),
        Task.countDocuments({ onboardingId, status: "done" }),
        Onboarding.findById(onboardingId).select('status')
    ]); 

    const progress = total === 0 ? 0 : Math.floor((done / total) * 100);

    const updateFields = { progressPercent: progress };

    if (progress === 100 && onboarding?.status !== 'cancelled') {
        updateFields.status = "completed";
        updateFields.completedAt = new Date();
    }else if(progress !== 100 && onboarding?.status !== 'cancelled'){
        updateFields.status = "active";
        updateFields.completedAt = null;
    }

    await Onboarding.findByIdAndUpdate(
        onboardingId,
        {$set: updateFields}
    )
}
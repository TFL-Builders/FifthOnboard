import Onboarding from "../models/Onboarding.js";
import Task from "../models/Task.js";

export async function recomputeProgress(onboardingId) {
    const [total, done] = await Promise.all([
        Task.countDocuments({ onboardingId }),
        Task.countDocuments({ onboardingId, status: "done" })
    ]); 

    const progress = total === 0 ? 0 : Math.floor((done / total) * 100);

    const updateFields = { progressPercent: progress };

    if (progress === 100) {
        updateFields.status = "completed";
        updateFields.completedAt = new Date();
    }

    await Onboarding.findByIdAndUpdate(
        onboardingId,
        {$set: updateFields}
    )
}
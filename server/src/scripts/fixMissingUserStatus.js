import "../env.js";
import mongoose from "mongoose";
import User from "../models/User.js";

async function run() {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not set — check server/src/.env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const broken = await User.find({ status: { $exists: false } }).select(
        "name email role department organizationId"
    );

    if (broken.length === 0) {
        console.log("No users with a missing status field. Nothing to fix.");
    } else {
        console.log(`Found ${broken.length} user(s) with a missing status:`);
        broken.forEach((u) => console.log(`  - ${u.name} <${u.email}> (${u.role}, ${u.department ?? "no dept"})`));

        const result = await User.updateMany(
            { status: { $exists: false } },
            { $set: { status: "active" } }
        );
        console.log(`Set status: "active" on ${result.modifiedCount} user(s).`);
    }

    await mongoose.disconnect();
}

run().catch((error) => {
    console.error("Fatal error:", error);
    process.exitCode = 1;
});

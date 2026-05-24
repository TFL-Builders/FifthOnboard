export function organizationGuard(req, res, next){
    const userOrgId = req.user.organizationId;
    if (!userOrgId){
        return res.status(403).json({ message: "No organization associated with this account" });
    }
    req.organizationId = userOrgId;
    next();
}
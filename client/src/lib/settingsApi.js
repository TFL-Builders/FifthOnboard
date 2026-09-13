export const getSettings = (authedApi) => authedApi.get("/dashboard/settings").then((res) => res.data);

export const updateSettings = (authedApi, payload) => authedApi.patch("/dashboard/settings", payload).then((res) => res.data);

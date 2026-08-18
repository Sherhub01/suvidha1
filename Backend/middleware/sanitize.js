// Removes MongoDB query operators from untrusted input.
//
// Keys beginning with "$" (e.g. { email: { "$ne": null } }) or containing "."
// can change the shape of a Mongoose query and turn a login check into an
// always-true match. Objects are cleaned in place because Express 5 exposes
// req.query as a read-only getter, so it cannot be reassigned.

const isPlainObject = (value) =>
    value !== null && typeof value === "object" && !Buffer.isBuffer(value);

const scrub = (value, depth = 0) => {
    if (depth > 10 || !isPlainObject(value)) return;

    if (Array.isArray(value)) {
        for (const item of value) scrub(item, depth + 1);
        return;
    }

    for (const key of Object.keys(value)) {
        if (key.startsWith("$") || key.includes(".")) {
            delete value[key];
            continue;
        }
        scrub(value[key], depth + 1);
    }
};

export const sanitizeRequest = (req, res, next) => {
    scrub(req.body);
    scrub(req.params);
    // req.query is a getter in Express 5 — mutate the object it returns.
    scrub(req.query);
    next();
};

export default sanitizeRequest;

import { ZodError } from 'zod';

// Returns an Express middleware that validates req.body against the given Zod
// schema. On failure it responds 400 with a generic, safe error message; on
// success it replaces req.body with the parsed value and continues.
export function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body ?? {});
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.issues || err.errors || [];
        return res.status(400).json({
          error: 'ورودی نامعتبر است',
          details: issues.map((e) => ({ path: (e.path || []).join('.'), message: e.message })),
        });
      }
      next(err);
    }
  };
}

export default validate;

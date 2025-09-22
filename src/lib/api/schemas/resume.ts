import * as z from 'zod';

export const resumeDownloadSchema = z.object({
    "message": z.string(),
    "attachment": z.object({
        "type": z.literal("document"),
        "url": z.string(),
        "filename": z.string(),
    })
});


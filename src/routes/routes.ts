import { Router, Response, Request } from "express";

const router = Router();

// home page
router.get("/", (req: Request, res: Response) => {
    res.send('hello world!');
});


export default router;
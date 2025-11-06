import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  return res.json({ status: 'ok', timestamp: new Date() });
});

export { router };

import { StatusCodes } from 'http-status-codes';
import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  return res.status(StatusCodes.OK).json({
    status: 'ok',
    timestamp: new Date(),
  });
});

export { router };

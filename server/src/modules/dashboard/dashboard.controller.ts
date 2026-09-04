import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getStats(req.user!);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

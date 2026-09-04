import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { loginSchema } from './auth.schema';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const { user, token } = await AuthService.login(data);

      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // Localhost dev setup
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({ message: 'Login successful', user });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      });
      res.json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ user: req.user });
    } catch (error) {
      next(error);
    }
  }
}

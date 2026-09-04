import { Request, Response, NextFunction } from 'express';
import { VouchersService } from './vouchers.service';
import { createVoucherSchema, updateVoucherSchema, queryVoucherSchema, rejectVoucherSchema } from './vouchers.schema';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const fileTypeFromBuffer = async (buffer: Buffer) => {
  const fileType = await import('file-type');
  const fromBuffer = fileType.default ? fileType.default.fromBuffer : fileType.fromBuffer;
  return fromBuffer(buffer);
};

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

export class VouchersController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createVoucherSchema.parse(req.body);
      const voucher = await VouchersService.create(data, req.user!);
      res.status(201).json({ voucher });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = queryVoucherSchema.parse(req.query);
      const result = await VouchersService.list(query, req.user!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const voucher = await VouchersService.getById(req.params.id as string, req.user!);
      res.json({ voucher });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateVoucherSchema.parse(req.body);
      const voucher = await VouchersService.update(req.params.id as string, data, req.user!);
      res.json({ voucher });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await VouchersService.delete(req.params.id as string, req.user!);
      res.json({ success: true, message: 'Voucher deleted' });
    } catch (error) {
      next(error);
    }
  }

  static async uploadEmployeeSignature(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw { statusCode: 400, code: 'BAD_REQUEST', message: 'Signature file is required' };
      
      const type = await fileTypeFromBuffer(req.file.buffer);
      if (!type || !['image/png', 'image/jpeg'].includes(type.mime)) {
        throw { statusCode: 400, code: 'BAD_REQUEST', message: 'Only PNG and JPEG files are allowed' };
      }

      const key = `${uuidv4()}.${type.ext}`;
      const filePath = path.join(process.cwd(), 'uploads/signatures', key);
      await fs.promises.writeFile(filePath, req.file.buffer);

      const voucher = await VouchersService.updateEmployeeSignature(req.params.id as string, key, req.user!);
      res.json({ voucher });
    } catch (error) {
      next(error);
    }
  }

  static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const voucher = await VouchersService.submit(req.params.id as string, req.user!);
      res.json({ voucher });
    } catch (error) {
      next(error);
    }
  }

  static async approve(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw { statusCode: 400, code: 'BAD_REQUEST', message: 'Signature file is required' };
      
      const type = await fileTypeFromBuffer(req.file.buffer);
      if (!type || !['image/png', 'image/jpeg'].includes(type.mime)) {
        throw { statusCode: 400, code: 'BAD_REQUEST', message: 'Only PNG and JPEG files are allowed' };
      }

      const key = `${uuidv4()}.${type.ext}`;
      const filePath = path.join(process.cwd(), 'uploads/signatures', key);
      await fs.promises.writeFile(filePath, req.file.buffer);

      const voucher = await VouchersService.approve(req.params.id as string, key, req.user!);
      res.json({ voucher });
    } catch (error) {
      next(error);
    }
  }

  static async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const { rejectionReason } = rejectVoucherSchema.parse(req.body);
      const voucher = await VouchersService.reject(req.params.id as string, rejectionReason, req.user!);
      res.json({ voucher });
    } catch (error) {
      next(error);
    }
  }

  static async getSignature(req: Request, res: Response, next: NextFunction) {
    try {
      const type = req.params.type as 'employee' | 'director';
      if (type !== 'employee' && type !== 'director') {
         throw { statusCode: 400, code: 'BAD_REQUEST', message: 'Invalid signature type' };
      }
      const filePath = await VouchersService.getSignaturePath(req.params.id as string, type, req.user!);
      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }
}

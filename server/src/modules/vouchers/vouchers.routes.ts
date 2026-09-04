import { Router } from 'express';
import { VouchersController, upload } from './vouchers.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);

// List and Create
router.get('/', VouchersController.list);
router.post('/', authorize(['EMPLOYEE']), VouchersController.create);

// Details
router.get('/:id', VouchersController.getById);

// Employee actions on DRAFT
router.patch('/:id', authorize(['EMPLOYEE']), VouchersController.update);
router.delete('/:id', authorize(['EMPLOYEE']), VouchersController.delete);
router.post('/:id/employee-signature', authorize(['EMPLOYEE']), upload.single('signature'), VouchersController.uploadEmployeeSignature);
router.post('/:id/submit', authorize(['EMPLOYEE']), VouchersController.submit);

// Director actions on PENDING_APPROVAL
router.post('/:id/approve', authorize(['DIRECTOR']), upload.single('signature'), VouchersController.approve);
router.post('/:id/reject', authorize(['DIRECTOR']), VouchersController.reject);

// Signature retrieval
router.get('/:id/signatures/:type', VouchersController.getSignature);

export { router as vouchersRoutes };

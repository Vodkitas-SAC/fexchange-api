import { Router } from 'express';
import { MonedaController } from '../Controllers/MonedaController';
import { JwtHelper } from '../Helpers/JwtHelper';
import { RolUsuario } from '../DbModel/Enums';

const router = Router();
const controller = new MonedaController();

// Rutas públicas (consulta)
router.get('/', controller.getAll);
router.get('/active', controller.getActive);
router.get('/search', controller.search);
router.get('/:id', controller.getById);
router.get('/codigo/:codigo', controller.getByCodigo);
router.get('/:id/can-be-deleted', controller.canBeDeleted);

// Rutas protegidas (requieren autenticación y permisos de administrador)
router.post(
  '/',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.create
);

router.put(
  '/:id',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.update
);

router.patch(
  '/:id/toggle-active',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.toggleActive
);

router.delete(
  '/:id',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO),
  controller.delete
);

export default router;
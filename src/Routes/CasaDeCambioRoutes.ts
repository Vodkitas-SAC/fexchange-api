import { Router } from 'express';
import { CasaDeCambioController } from '../Controllers/CasaDeCambioController';
import { JwtHelper } from '../Helpers/JwtHelper';
import { RolUsuario } from '../DbModel/Enums';

const router = Router();
const controller = new CasaDeCambioController();

// Rutas públicas (solo para consulta)
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.get('/identificador/:identificador', controller.getByIdentificador);
router.get('/:id/verify-requirements', controller.verifyRequirements);

// Rutas protegidas (requieren autenticación y permisos de administrador)
router.post(
  '/',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO),
  controller.create
);

router.put(
  '/:id',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  JwtHelper.verifyCasaDeCambio,
  controller.update
);

router.delete(
  '/:id',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO),
  controller.delete
);

router.patch(
  '/:id/toggle-active',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  JwtHelper.verifyCasaDeCambio,
  controller.toggleActive
);

export default router;
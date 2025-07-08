import { Router } from 'express';
import { UsuarioController } from '../Controllers/UsuarioController';
import { JwtHelper } from '../Helpers/JwtHelper';
import { RolUsuario } from '../DbModel/Enums';

const router = Router();
const controller = new UsuarioController();

// Rutas públicas
router.post('/login', controller.login);

// Rutas protegidas
router.post(
  '/',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.create
);

router.get(
  '/casa-de-cambio/:casaDeCambioId',
  JwtHelper.authenticateToken,
  JwtHelper.verifyCasaDeCambio,
  controller.getByCasaDeCambio
);

router.get(
  '/:id',
  JwtHelper.authenticateToken,
  controller.getById
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

router.post(
  '/:id/change-password',
  JwtHelper.authenticateToken,
  controller.changePassword
);

router.get(
  '/casa-de-cambio/:casaDeCambioId/verify-admin-requirements',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.verifyAdminRequirements
);

// Rutas específicas para usuarios de ventanilla
router.get(
  '/ventanilla/activa',
  JwtHelper.authenticateToken,
  controller.hasVentanillaActiva
);

router.get(
  '/ventanilla/can-aperturar/:ventanillaId',
  JwtHelper.authenticateToken,
  controller.canAperturarVentanilla
);

router.get(
  '/ventanilla/mi-ventanilla-activa',
  JwtHelper.authenticateToken,
  controller.getVentanillaActiva
);

router.get(
  '/can-view-ganancias',
  JwtHelper.authenticateToken,
  controller.canViewGanancias
);

router.get(
  '/casa-de-cambio/:casaDeCambioId/ventanilla',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.getUsuariosVentanilla
);

export default router;
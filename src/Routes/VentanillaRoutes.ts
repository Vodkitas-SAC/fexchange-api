import { Router } from 'express';
import { VentanillaController } from '../Controllers/VentanillaController';
import { JwtHelper } from '../Helpers/JwtHelper';
import { RolUsuario } from '../DbModel/Enums';

const router = Router();
const controller = new VentanillaController();

// Rutas de consulta (requieren autenticación básica)
router.get(
  '/',
  JwtHelper.authenticateToken,
  controller.getAll
);
router.get(
  '/casa-de-cambio/:casaDeCambioId',
  JwtHelper.authenticateToken,
  JwtHelper.verifyCasaDeCambio,
  controller.getByCasaDeCambio
);

router.get(
  '/casa-de-cambio/:casaDeCambioId/estado/:estado',
  JwtHelper.authenticateToken,
  JwtHelper.verifyCasaDeCambio,
  controller.getByEstado
);

router.get(
  '/:id',
  JwtHelper.authenticateToken,
  controller.getById
);

router.get(
  '/identificador/:identificador',
  JwtHelper.authenticateToken,
  controller.getByIdentificador
);

router.get(
  '/:id/puede-atender',
  JwtHelper.authenticateToken,
  controller.puedeAtender
);

router.get(
  '/:id/historial',
  JwtHelper.authenticateToken,
  controller.getHistorial
);

router.get(
  '/:id/apertura-activa',
  JwtHelper.authenticateToken,
  controller.getAperturaActiva
);

router.get(
  '/:id/resumen-cierre',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR, RolUsuario.ENCARGADO_VENTANILLA),
  controller.getResumenCierre
);

router.get(
  '/:id/verificar-disponibilidad',
  JwtHelper.authenticateToken,
  controller.verificarDisponibilidad
);

router.get(
  '/:id/verificar-tipos-cambio',
  JwtHelper.authenticateToken,
  controller.verificarTiposCambio
);

router.get(
  '/:id/verificar-permisos',
  JwtHelper.authenticateToken,
  controller.verificarPermisosOperacion
);

// Rutas de administración (requieren permisos de admin)
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

// Rutas de operación (requieren ser encargado de ventanilla o admin)
router.post(
  '/:id/aperturar',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR, RolUsuario.ENCARGADO_VENTANILLA),
  controller.aperturar
);

router.post(
  '/:id/cerrar',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR, RolUsuario.ENCARGADO_VENTANILLA),
  controller.cerrar
);

router.post(
  '/:id/procesar-cierre',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR, RolUsuario.ENCARGADO_VENTANILLA),
  controller.procesarCierre
);

router.patch(
  '/:id/pausar',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR, RolUsuario.ENCARGADO_VENTANILLA),
  controller.pausar
);

router.patch(
  '/:id/reanudar',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR, RolUsuario.ENCARGADO_VENTANILLA),
  controller.reanudar
);

export default router;
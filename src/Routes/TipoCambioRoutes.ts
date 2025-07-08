import { Router } from 'express';
import { TipoCambioController } from '../Controllers/TipoCambioController';
import { JwtHelper } from '../Helpers/JwtHelper';
import { RolUsuario } from '../DbModel/Enums';

const router = Router();
const controller = new TipoCambioController();

// Rutas públicas (consulta)
router.get('/verificar-disponibilidad', controller.verificarDisponibilidad);
router.post('/vigente', controller.getTipoCambioVigente);
router.get('/actuales', controller.getTiposCambioActuales);

// Rutas con autenticación

// Crear tipo de cambio (solo administradores)
router.post(
  '/',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.create
);

// Consultas generales
router.get('/', controller.getAll);
router.get('/:id', controller.getById);

// Por casa de cambio
router.get('/casa-de-cambio/:casaDeCambioId', controller.getActivosPorCasa);
router.get('/casa-de-cambio/:casaDeCambioId/completo', controller.getByCasaDeCambio);
router.get('/casa-de-cambio/:casaDeCambioId/pares-disponibles', controller.getParesDisponibles);

// Historial
router.get(
  '/historial/:monedaOrigenId/:monedaDestinoId/:casaDeCambioId',
  JwtHelper.authenticateToken,
  controller.getHistorial
);

// Actualizar tipo de cambio (solo administradores)
router.put(
  '/:id',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.update
);

// Activar/Desactivar (solo administradores)
router.patch(
  '/:id/activar',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.activar
);

router.patch(
  '/:id/desactivar',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.desactivar
);

// Eliminar tipo de cambio (solo administradores)
router.delete(
  '/:id',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.delete
);

export default router;
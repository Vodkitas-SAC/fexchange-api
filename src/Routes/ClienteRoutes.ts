import { Router } from 'express';
import { ClienteController } from '../Controllers/ClienteController';
import { JwtHelper } from '../Helpers/JwtHelper';
import { RolUsuario } from '../DbModel/Enums';

const router = Router();
const controller = new ClienteController();

// Rutas para gestión de clientes

// Crear clientes (diferentes tipos)
router.post(
  '/',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR, RolUsuario.ENCARGADO_VENTANILLA),
  controller.create
);

router.post(
  '/registrado',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR, RolUsuario.ENCARGADO_VENTANILLA),
  controller.createRegistrado
);

router.post(
  '/ocasional',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR, RolUsuario.ENCARGADO_VENTANILLA),
  controller.createOcasional
);

router.post(
  '/empresarial',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR, RolUsuario.ENCARGADO_VENTANILLA),
  controller.createEmpresarial
);

// Consultas de clientes
router.get('/search', JwtHelper.authenticateToken, controller.search);
router.get('/tipo/:tipo', JwtHelper.authenticateToken, controller.getByTipo);
router.get('/documento/:documento', JwtHelper.authenticateToken, controller.getByDocumento);
router.get('/ruc/:ruc/existe', JwtHelper.authenticateToken, controller.existeRuc);
router.get('/:id/historial', JwtHelper.authenticateToken, controller.getHistorial);
router.get('/:id', JwtHelper.authenticateToken, controller.getById);
router.get('/', JwtHelper.authenticateToken, controller.getAll);

// Validar datos de cliente
router.post('/validar', JwtHelper.authenticateToken, controller.validarDatos);

// Actualizar cliente
router.put(
  '/:id',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.update
);

// Activar/Desactivar cliente
router.patch(
  '/:id/toggle-estado',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.toggleEstado
);

// Eliminar cliente (solo administradores)
router.delete(
  '/:id',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.delete
);

export default router;
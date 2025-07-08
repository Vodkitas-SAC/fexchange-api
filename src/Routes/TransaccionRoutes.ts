import { Router } from 'express';
import { TransaccionController } from '../Controllers/TransaccionController';
import { JwtHelper } from '../Helpers/JwtHelper';
import { RolUsuario } from '../DbModel/Enums';

const router = Router();
const controller = new TransaccionController();

// Rutas protegidas - requieren autenticación

// Procesar transacción (solo encargados de ventanilla y administradores)
router.post(
  '/procesar-cambio',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ENCARGADO_VENTANILLA, RolUsuario.ADMINISTRADOR, RolUsuario.ADMINISTRADOR_MAESTRO),
  controller.procesarCambio
);

// Cancelar transacción (solo administradores)
router.patch(
  '/:id/cancelar',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR, RolUsuario.ADMINISTRADOR_MAESTRO),
  controller.cancelar
);

// Consultas públicas (dentro del sistema)
router.post('/calcular-conversion', controller.calcularConversion);
router.post('/verificar-disponibilidad', controller.verificarDisponibilidad);

// Consultas de transacciones (requieren autenticación)
router.get(
  '/ventanilla/:ventanillaId',
  JwtHelper.authenticateToken,
  controller.getByVentanilla
);

router.get(
  '/cliente/:clienteId',
  JwtHelper.authenticateToken,
  controller.getByCliente
);

router.get(
  '/numero/:numero',
  JwtHelper.authenticateToken,
  controller.getByNumero
);

// Consulta general con filtros (administradores)
router.get(
  '/consultar',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR, RolUsuario.ADMINISTRADOR_MAESTRO),
  controller.consultar
);

// Listar todas las transacciones (administradores)
router.get(
  '/',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR, RolUsuario.ADMINISTRADOR_MAESTRO),
  controller.getAll
);

export default router;
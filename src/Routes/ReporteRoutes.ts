import { Router } from 'express';
import { ReporteController } from '../Controllers/ReporteController';
import { JwtHelper } from '../Helpers/JwtHelper';
import { RolUsuario } from '../DbModel/Enums';

const router = Router();
const controller = new ReporteController();

// Todas las rutas de reportes requieren autenticación

// Reporte principal de ganancias (solo administradores)
router.post(
  '/ganancias',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.generarReporteGanancias
);

// Reportes de ganancias por período
router.get(
  '/ganancias/diario',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.getGananciasPorDia
);

router.get(
  '/ganancias/semanal',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.getGananciasPorSemana
);

router.get(
  '/ganancias/mensual',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.getGananciasPorMes
);

router.get(
  '/ganancias/anual',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.getGananciasPorAno
);

// Reportes de transacciones
router.get(
  '/transacciones/resumen',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.getResumenTransacciones
);

router.get(
  '/transacciones/mas-rentables/:casaDeCambioId',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.getTransaccionesMasRentables
);

// Reportes de rendimiento
router.get(
  '/rendimiento/ventanillas/:casaDeCambioId',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.getRendimientoPorVentanilla
);

router.get(
  '/estadisticas/monedas/:casaDeCambioId',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.getEstadisticasPorMoneda
);

// Reporte SBS (solo administrador maestro)
router.get(
  '/sbs/:casaDeCambioId',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO),
  controller.generarReporteSBS
);

// Dashboard general (administradores y encargados)
router.get(
  '/dashboard',
  JwtHelper.authenticateToken,
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR, RolUsuario.ENCARGADO_VENTANILLA),
  controller.getDashboard
);

export default router;
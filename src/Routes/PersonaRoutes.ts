import { Router } from 'express';
import { PersonaController } from '../Controllers/PersonaController';
import { JwtHelper } from '../Helpers/JwtHelper';
import { RolUsuario } from '../DbModel/Enums';

const router = Router();
const controller = new PersonaController();

// Todas las rutas requieren autenticación
router.use(JwtHelper.authenticateToken);

// Rutas de consulta (todos los roles autenticados)
router.get('/', controller.getAll);
router.get('/search', controller.searchByName);
router.get('/:id', controller.getById);
router.get('/documento/:numeroDocumento', controller.getByNumeroDocumento);
router.get('/:id/can-be-deleted', controller.canBeDeleted);

// Rutas de modificación (solo administradores)
router.post(
  '/',
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.create
);

router.put(
  '/:id',
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.update
);

router.delete(
  '/:id',
  JwtHelper.authorize(RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR),
  controller.delete
);

export default router;
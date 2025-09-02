import { Router } from 'express';
import { NoteController } from '../controllers/note.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);


router.post('/', NoteController.createNote);
router.get('/company/:companyId',  NoteController.getNotes);
router.get('/:id', NoteController.getNoteById);
router.put('/:id', NoteController.updateNote);
router.delete('/:id', NoteController.deleteNote);


export default router;

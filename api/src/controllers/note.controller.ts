import { Company } from "../models/Company";
import { INote, Note } from "../models/Note";
import { NotFoundError } from "../errors";
import { NextFunction, Request, Response } from "express";

 


export class NoteController {
 static async createNote(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.user!;
    const { content, type, companyId } = req.body as unknown as INote;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      throw new NotFoundError("Company not found");
    }

          const note = await Note.create({
        content,
        type,
        companyId,
        createdBy: userId,
      });

   

      return res.status(201).json({
        success: true,
        message: "Note created successfully",
        data: note,
      });
  } catch (error) {
    return next(error);
  }
}

  static async getNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.params;
     
      
      const notes = await Note.find({ companyId }).populate('createdBy', 'firstName lastName');
      
      
      return res.status(200).json({
        success: true,
        message: 'Notes fetched successfully',
        data: notes
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getNoteById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const note = await Note.findById(id).populate('createdBy', 'firstName lastName');
      if (!note) {
        throw new NotFoundError('Note not found');
      }
      return res.status(200).json({
        success: true,
        message: 'Note fetched successfully',
        data: note
      });
    } catch (error) {

      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching note'
      });
    }
  }

  static async updateNote(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.user!;
      const { content, type } = req.body as unknown as INote;
      
      
      
      const note = await Note.findByIdAndUpdate(
        id, 
        { content, type, updatedBy: userId }, 
        { new: true }
      ).populate('createdBy', 'firstName lastName');
      
      if (!note) {
        throw new NotFoundError('Note not found');
      }
      
  
      
      return res.status(200).json({
        success: true,
        message: 'Note updated successfully',
        data: note
      });
    } catch (error) {
     
      return res.status(500).json({
        success: false,
        message: 'Internal server error while updating note'
      });
    }
  }

  static async deleteNote(req: Request, res: Response) {
    try {
      const { id } = req.params;
     
      
      // First check if the note exists
      const existingNote = await Note.findById(id);
      if (!existingNote) {
        
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }
      
     
      
      // Now delete the note
      const deletedNote = await Note.findByIdAndDelete(id);
      if (!deletedNote) {
       
        return res.status(500).json({
          success: false,
          message: 'Failed to delete note'
        });
      }
      
     
      return res.status(200).json({
        success: true,
        message: 'Note deleted successfully',
      });
    } catch (error) {
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error while deleting note'
      });
    }
  }
}



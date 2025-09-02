import { Company } from "../models/Company";
import { ITask, Task } from "../models/Task";
import { NotFoundError } from "../errors";
import { Request, Response } from "express";

export class TaskController {
  static async createTask(req: Request, res: Response) {
    try {
      const { userId } = req.user!;
      const { title, description, dueDate, priority, assignedTo, companyId } = req.body as unknown as ITask;

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

      const task = await Task.create({
        title,
        description,
        dueDate,
        priority,
        assignedTo: assignedTo || 'Unassigned',
        companyId,
        createdBy: userId,
        status: 'pending'
      });

      console.log('🔍 Backend: Task created successfully:', task);

      return res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
    } catch (error) {
      console.error('🔍 Backend: Error creating task:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while creating task'
      });
    }
  }

  static async getTasks(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      console.log('🔍 Backend: Fetching tasks for company:', companyId);
      
      const tasks = await Task.find({ companyId })
        .populate('createdBy', 'firstName lastName');
      
      console.log('🔍 Backend: Found tasks:', tasks);
      
      return res.status(200).json({
        success: true,
        message: 'Tasks fetched successfully',
        data: tasks
      });
    } catch (error) {
      console.error('🔍 Backend: Error fetching tasks:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching tasks'
      });
    }
  }

  static async getTaskById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await Task.findById(id)
        .populate('createdBy', 'firstName lastName');
      
      if (!task) {
        throw new NotFoundError('Task not found');
      }
      
      return res.status(200).json({
        success: true,
        message: 'Task fetched successfully',
        data: task
      });
    } catch (error) {
      console.error('🔍 Backend: Error getting task by ID:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching task'
      });
    }
  }

  static async updateTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.user!;
      const { title, description, dueDate, priority, assignedTo, status } = req.body as unknown as ITask;
      
      console.log('🔍 Backend: Updating task:', { id, title, description, dueDate, priority, assignedTo, status, userId });
      
      const task = await Task.findByIdAndUpdate(
        id, 
        { 
          title, 
          description, 
          dueDate, 
          priority, 
          assignedTo, 
          status,
          updatedBy: userId 
        }, 
        { new: true }
      ).populate('createdBy', 'firstName lastName');
      
      if (!task) {
        throw new NotFoundError('Task not found');
      }
      
      console.log('🔍 Backend: Task updated successfully:', task);
      
      return res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task
      });
    } catch (error) {
      console.error('🔍 Backend: Error updating task:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while updating task'
      });
    }
  }

  static async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log('🔍 Backend: Deleting task with ID:', id);
      
      // First check if the task exists
      const existingTask = await Task.findById(id);
      if (!existingTask) {
        console.log('🔍 Backend: Task not found with ID:', id);
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      
      console.log('🔍 Backend: Found task to delete:', existingTask);
      
      // Now delete the task
      const deletedTask = await Task.findByIdAndDelete(id);
      if (!deletedTask) {
        console.log('🔍 Backend: Failed to delete task with ID:', id);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete task'
        });
      }
      
      console.log('🔍 Backend: Task deleted successfully:', deletedTask);
      
      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      console.error('🔍 Backend: Error deleting task:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while deleting task'
      });
    }
  }
}

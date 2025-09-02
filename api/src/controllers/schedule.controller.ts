import { Company } from "../models/Company";
import { ISchedule, Schedule } from "../models/Schedule";
import { NotFoundError } from "../errors";
import { Request, Response } from "express";

export class ScheduleController {
  static async createSchedule(req: Request, res: Response) {
    try {
      const { userId } = req.user!;
      const { meetingTitle, date, time, duration, attendees, notes, companyId } = req.body as unknown as ISchedule;

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

      const schedule = await Schedule.create({
        meetingTitle,
        date,
        time,
        duration,
        attendees,
        notes,
        companyId,
        createdBy: userId,
        status: 'scheduled'
      });

  

      return res.status(201).json({
        success: true,
        message: "Schedule created successfully",
        data: schedule,
      });
    } catch (error) {
    
      return res.status(500).json({
        success: false,
        message: 'Internal server error while creating schedule'
      });
    }
  }

  static async getSchedules(req: Request, res: Response) {
    try {
      const { companyId } = req.params;

      
      const schedules = await Schedule.find({ companyId })
        .populate('createdBy', 'firstName lastName');
      
   
      
      return res.status(200).json({
        success: true,
        message: 'Schedules fetched successfully',
        data: schedules
      });
    } catch (error) {
   
      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching schedules'
      });
    }
  }

  static async getScheduleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schedule = await Schedule.findById(id)
        .populate('createdBy', 'firstName lastName');
      
      if (!schedule) {
        throw new NotFoundError('Schedule not found');
      }
      
      return res.status(200).json({
        success: true,
        message: 'Schedule fetched successfully',
        data: schedule
      });
    } catch (error) {
     
      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching schedule'
      });
    }
  }

  static async updateSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.user!;
      const { meetingTitle, date, time, duration, attendees, notes, status } = req.body as unknown as ISchedule;
      
     
      
      const schedule = await Schedule.findByIdAndUpdate(
        id, 
        { 
          meetingTitle, 
          date, 
          time, 
          duration, 
          attendees, 
          notes,
          status,
          updatedBy: userId 
        }, 
        { new: true }
      ).populate('createdBy', 'firstName lastName');
      
      if (!schedule) {
        throw new NotFoundError('Schedule not found');
      }
      
     
      
      return res.status(200).json({
        success: true,
        message: 'Schedule updated successfully',
        data: schedule
      });
    } catch (error) {
    
      return res.status(500).json({
        success: false,
        message: 'Internal server error while updating schedule'
      });
    }
  }

  static async deleteSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;
    
      
      const existingSchedule = await Schedule.findById(id);
      if (!existingSchedule) {
        
        return res.status(404).json({
          success: false,
          message: 'Schedule not found'
        });
      }
      
     
      const deletedSchedule = await Schedule.findByIdAndDelete(id);
      if (!deletedSchedule) {
        console.log('🔍 Backend: Failed to delete schedule with ID:', id);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete schedule'
        });
      }
      
      console.log('🔍 Backend: Schedule deleted successfully:', deletedSchedule);
      
      return res.status(200).json({
        success: true,
        message: 'Schedule deleted successfully',
      });
    } catch (error) {
      console.error('🔍 Backend: Error deleting schedule:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while deleting schedule'
      });
    }
  }
} 
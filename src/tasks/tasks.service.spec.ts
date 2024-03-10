import { Test } from '@nestjs/testing';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';

const mockTasksRespository = () => ({
  getTasks: jest.fn(),
  findOneBy: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
  save: jest.fn(),
});

const mockUser = {
  username: 'Ariel',
  id: 'someId',
  password: 'somePassword',
  tasks: [],
};

const mockTask = {
  title: 'Test title',
  description: 'Test desc',
  id: 'someId',
  status: TaskStatus.OPEN,
};

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useFactory: mockTasksRespository },
      ],
    }).compile();

    tasksService = module.get(TasksService);
    tasksRepository = module.get(TasksRepository);
  });

  describe('getTasks', () => {
    it('calls TasksRepository.getTasks and returns the result', async () => {
      // expect(tasksRepository.getTasks).not.toHaveBeenCalled();
      tasksRepository.getTasks.mockResolvedValue('someValue');
      const result = await tasksService.getTasks(null, mockUser);
      // expect(tasksRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('someValue');
    });
  });

  describe('getTaskById', () => {
    it('calls TasksRepository.findOneBy and returns the result', async () => {
      tasksRepository.findOneBy.mockResolvedValue(mockTask);
      const result = await tasksService.getTaskById('someId', mockUser);
      expect(result).toEqual(mockTask);
    });

    it('calls TasksRepository.findOneBy and handles an error', async () => {
      tasksRepository.findOneBy.mockResolvedValue(null);
      expect(tasksService.getTaskById('someId', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('calls TasksRepository.createTask and returns the result', async () => {
      const mockCreateTaskDto = {
        title: 'Test title',
        description: 'Test desc',
      };

      tasksRepository.createTask.mockResolvedValue(mockTask);
      const result = await tasksService.createTask(mockCreateTaskDto, mockUser);
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('calls TasksRepository.delete and handles task deletion', async () => {
      tasksRepository.delete.mockResolvedValue({ affected: 1 });
      await expect(
        tasksService.deleteTask('someId', mockUser),
      ).resolves.toBeUndefined();
    });

    it('calls TasksRepository.delete and handles non-existent task', async () => {
      tasksRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(tasksService.deleteTask('someId', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('calls TasksRepository.save the updated task status', async () => {
      const updatedStatus = TaskStatus.IN_PROGRESS;

      tasksRepository.findOneBy.mockResolvedValue(mockTask);

      const result = await tasksService.updateTaskStatus(
        'someId',
        updatedStatus,
        mockUser,
      );

      expect(result.status).toEqual(updatedStatus);
    });
  });
});

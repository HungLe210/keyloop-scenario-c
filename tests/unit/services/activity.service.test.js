const { describe, it, expect, beforeEach } = require('@jest/globals');
const ActivityService = require('../../../src/services/activity.service');
const { NotFoundError, ValidationError } = require('../../../src/errors');

describe('ActivityService', () => {
    let activityService;
    let mockActivityModel;
    let mockLeadModel;

    beforeEach(() => {
        mockActivityModel = {
            create: jest.fn(),
            findByLeadId: jest.fn()
        };

        mockLeadModel = {
            findById: jest.fn()
        };

        activityService = new ActivityService(mockActivityModel, mockLeadModel);
    });

    describe('createActivity', () => {
        it('should create activity for existing lead', async () => {
            const mockLead = { id: 1, name: 'John Doe' };
            const activityData = { type: 'CALL', note: 'Follow-up call' };
            const mockActivity = { id: 1, lead_id: 1, ...activityData };

            mockLeadModel.findById.mockResolvedValue(mockLead);
            mockActivityModel.create.mockResolvedValue(mockActivity);

            const result = await activityService.createActivity(1, activityData);

            expect(result).toEqual(mockActivity);
            expect(mockLeadModel.findById).toHaveBeenCalledWith(1);
            expect(mockActivityModel.create).toHaveBeenCalledWith({
                lead_id: 1,
                type: 'CALL',
                note: 'Follow-up call'
            });
        });

        it('should throw NotFoundError when lead does not exist', async () => {
            mockLeadModel.findById.mockResolvedValue(null);

            await expect(activityService.createActivity(999, { type: 'CALL', note: 'Test' }))
                .rejects
                .toThrow(NotFoundError);
        });
    });

    describe('findActivitiesByLeadId', () => {
        it('should return all activities without pagination', async () => {
            const mockLead = { id: 1, name: 'John Doe' };
            const mockActivities = [
                { id: 1, type: 'CALL', note: 'First call' },
                { id: 2, type: 'EMAIL', note: 'Sent email' }
            ];

            mockLeadModel.findById.mockResolvedValue(mockLead);
            mockActivityModel.findByLeadId.mockResolvedValue({
                activities: mockActivities,
                total: 2
            });

            const result = await activityService.findActivitiesByLeadId(1, {});

            expect(result.activities).toEqual(mockActivities);
            expect(result.pagination.total).toBe(2);
            expect(result.pagination.page).toBeNull();
        });

        it('should return paginated activities', async () => {
            const mockLead = { id: 1, name: 'John Doe' };
            const mockActivities = [{ id: 1, type: 'CALL', note: 'Call' }];

            mockLeadModel.findById.mockResolvedValue(mockLead);
            mockActivityModel.findByLeadId.mockResolvedValue({
                activities: mockActivities,
                total: 10
            });

            const result = await activityService.findActivitiesByLeadId(1, { page: 1, limit: 5 });

            expect(result.activities).toEqual(mockActivities);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(5);
            expect(result.pagination.totalPages).toBe(2);
        });

        it('should throw NotFoundError when lead does not exist', async () => {
            mockLeadModel.findById.mockResolvedValue(null);

            await expect(activityService.findActivitiesByLeadId(999, {}))
                .rejects
                .toThrow(NotFoundError);
        });

        it('should throw ValidationError when only page provided', async () => {
            const mockLead = { id: 1, name: 'John Doe' };
            mockLeadModel.findById.mockResolvedValue(mockLead);

            await expect(activityService.findActivitiesByLeadId(1, { page: 1 }))
                .rejects
                .toThrow(ValidationError);
        });
    });
});

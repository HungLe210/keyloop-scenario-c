const { describe, it, expect, beforeEach } = require('@jest/globals');
const LeadService = require('../../../src/services/lead.service');
const { NotFoundError, ValidationError } = require('../../../src/errors');

describe('LeadService', () => {
    let leadService;
    let mockLeadModel;
    let mockActivityService;

    beforeEach(() => {
        mockLeadModel = {
            findAll: jest.fn(),
            findById: jest.fn()
        };

        mockActivityService = {
            findActivitiesByLeadId: jest.fn()
        };

        leadService = new LeadService(mockLeadModel, mockActivityService);
    });

    describe('findAllLeads', () => {
        it('should return all leads without pagination', async () => {
            const mockLeads = [
                { id: 1, name: 'John Doe', email: 'john@example.com' },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
            ];

            mockLeadModel.findAll.mockResolvedValue({
                leads: mockLeads,
                total: 2
            });

            const result = await leadService.findAllLeads({});

            expect(result.leads).toEqual(mockLeads);
            expect(result.pagination.total).toBe(2);
        });

        it('should return paginated leads', async () => {
            const mockLeads = [{ id: 1, name: 'John Doe' }];

            mockLeadModel.findAll.mockResolvedValue({
                leads: mockLeads,
                total: 10
            });

            const result = await leadService.findAllLeads({ page: 1, limit: 5 });

            expect(result.leads).toEqual(mockLeads);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(5);
            expect(result.pagination.totalPages).toBe(2);
        });

        it('should throw ValidationError when only page provided', async () => {
            await expect(leadService.findAllLeads({ page: 1 }))
                .rejects
                .toThrow(ValidationError);
        });
    });

    describe('findLeadById', () => {
        it('should return lead with recent activities', async () => {
            const mockLead = { id: 1, name: 'John Doe', email: 'john@example.com' };
            const mockActivities = [
                { id: 1, type: 'CALL', note: 'First call' }
            ];

            mockLeadModel.findById.mockResolvedValue(mockLead);
            mockActivityService.findActivitiesByLeadId.mockResolvedValue({
                activities: mockActivities
            });

            const result = await leadService.findLeadById(1);

            expect(result.recentActivities).toEqual(mockActivities);
        });

        it('should throw NotFoundError when lead not found', async () => {
            mockLeadModel.findById.mockResolvedValue(null);

            await expect(leadService.findLeadById(999))
                .rejects
                .toThrow(NotFoundError);
        });
    });
});

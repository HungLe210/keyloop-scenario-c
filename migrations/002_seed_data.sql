-- Seed data for sales_lead_management database
USE sales_lead_management;

-- Insert sample leads - incoming leads from dealership website
INSERT INTO leads (name, email, phone, created_at, updated_at) VALUES
('Nguyễn Văn An', 'nguyen.van.an@example.com', '0901234567', '2026-04-15 09:30:00', '2026-04-15 09:30:00'),
('John Smith', 'john.smith@example.com', '0912345678', '2026-04-18 10:15:00', '2026-04-18 10:15:00'),
('Trần Thị Bình', 'tran.thi.binh@example.com', '0923456789', '2026-04-20 11:00:00', '2026-04-20 11:00:00'),
('Sarah Johnson', 'sarah.johnson@example.com', '0934567890', '2026-04-22 13:20:00', '2026-04-22 13:20:00'),
('Lê Hoàng Cường', 'le.hoang.cuong@example.com', '0945678901', '2026-05-01 08:45:00', '2026-05-01 08:45:00'),
('Michael Chen', 'michael.chen@example.com', '0956789012', '2026-05-03 10:00:00', '2026-05-03 10:00:00'),
('Phạm Thị Dung', 'pham.thi.dung@example.com', '0967890123', '2026-05-04 11:30:00', '2026-05-04 11:30:00');

-- Insert sample activities - follow-up activities logged by salespeople
INSERT INTO activities (lead_id, type, note, created_at) VALUES
-- Activities for Nguyễn Văn An (lead_id: 1)
(1, 'NOTE', 'Khách hàng quan tâm đến Sản phẩm A, cần gửi thông tin chi tiết', '2026-04-15 09:35:00'),

-- Activities for John Smith (lead_id: 2)
(2, 'CALL', 'First call made, customer requested quotation', '2026-04-18 10:20:00'),
(2, 'EMAIL', 'Sent quotation and product brochure', '2026-04-19 09:00:00'),
(2, 'CALL', 'Follow-up call, customer is reviewing the proposal', '2026-04-20 14:30:00'),

-- Activities for Trần Thị Bình (lead_id: 3)
(3, 'CALL', 'Trao đổi về yêu cầu, khách hàng có ngân sách phù hợp', '2026-04-20 11:15:00'),
(3, 'EMAIL', 'Gửi đề xuất chi tiết và timeline triển khai', '2026-04-22 10:30:00'),
(3, 'CALL', 'Khách hàng đồng ý với đề xuất, đang chờ phê duyệt nội bộ', '2026-04-25 16:45:00'),

-- Activities for Sarah Johnson (lead_id: 4)
(4, 'CALL', 'Introduced services, customer very interested', '2026-04-22 13:30:00'),
(4, 'EMAIL', 'Sent draft contract and terms', '2026-04-24 09:00:00'),
(4, 'CALL', 'Negotiated contract terms', '2026-04-26 14:00:00'),
(4, 'NOTE', 'Customer ready to proceed, preparing final paperwork', '2026-04-30 10:00:00'),

-- Activities for Lê Hoàng Cường (lead_id: 5)
(5, 'CALL', 'Cuộc gọi giới thiệu, khách hàng yêu cầu demo sản phẩm', '2026-05-01 09:00:00'),
(5, 'EMAIL', 'Gửi lịch demo và tài liệu chuẩn bị', '2026-05-02 15:20:00'),

-- Activities for Michael Chen (lead_id: 6)
(6, 'NOTE', 'Inbound lead from website contact form, interested in enterprise plan', '2026-05-03 10:05:00'),

-- Activities for Phạm Thị Dung (lead_id: 7)
(7, 'CALL', 'Gọi điện tư vấn, khách hàng đang so sánh với đối thủ', '2026-05-04 11:45:00'),
(7, 'EMAIL', 'Đã gửi bảng so sánh tính năng và ưu đãi đặc biệt', '2026-05-04 14:20:00');

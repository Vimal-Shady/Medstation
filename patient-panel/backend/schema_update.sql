-- Add sample vending machines if they don't exist
INSERT IGNORE INTO vending_machines (machine_code, location) VALUES
('VM001', 'Main Hospital Lobby'),
('VM002', 'East Wing Pharmacy'),
('VM003', 'West Wing Entrance');

-- Add medicine stock to vending machines
INSERT IGNORE INTO vending_machine_medicines (machine_code, medicine_id, quantity) VALUES
('VM001', 1, 50),
('VM002', 1, 30),
('VM003', 1, 20);

-- Add more sample medicines if they don't exist
INSERT INTO medicines (name, description, stock_quantity, price)
SELECT 'Aspirin', 'Pain reliever and blood thinner', 200, 8
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE name = 'Aspirin');

INSERT INTO medicines (name, description, stock_quantity, price)
SELECT 'Amoxicillin', 'Antibiotic for bacterial infections', 150, 15
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE name = 'Amoxicillin');

INSERT INTO medicines (name, description, stock_quantity, price)
SELECT 'Loratadine', 'Antihistamine for allergies', 100, 12
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE name = 'Loratadine');

-- Add medicine stock to vending machines for new medicines
INSERT IGNORE INTO vending_machine_medicines (machine_code, medicine_id, quantity)
SELECT 'VM001', medicine_id, 40 FROM medicines WHERE name = 'Aspirin';

INSERT IGNORE INTO vending_machine_medicines (machine_code, medicine_id, quantity)
SELECT 'VM001', medicine_id, 30 FROM medicines WHERE name = 'Loratadine';

INSERT IGNORE INTO vending_machine_medicines (machine_code, medicine_id, quantity)
SELECT 'VM002', medicine_id, 20 FROM medicines WHERE name = 'Amoxicillin';

INSERT IGNORE INTO vending_machine_medicines (machine_code, medicine_id, quantity)
SELECT 'VM003', medicine_id, 40 FROM medicines WHERE name = 'Loratadine';

-- Add a column for QR code data in purchase_history if it doesn't exist
ALTER TABLE purchase_history ADD COLUMN IF NOT EXISTS qr_code TEXT;

-- Add a column for prescription_id in purchase_history if it doesn't exist
ALTER TABLE purchase_history ADD COLUMN IF NOT EXISTS prescription_id INT;

-- Add a column for vending_machine in purchase_history if it doesn't exist
ALTER TABLE purchase_history ADD COLUMN IF NOT EXISTS vending_machine VARCHAR(50);

-- Add a column for payment_method in purchase_history if it doesn't exist
ALTER TABLE purchase_history ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- Add a column for payment_status in purchase_history if it doesn't exist
ALTER TABLE purchase_history ADD COLUMN IF NOT EXISTS payment_status ENUM('pending', 'completed') DEFAULT 'pending';

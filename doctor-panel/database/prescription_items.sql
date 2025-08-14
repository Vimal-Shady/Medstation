-- Create prescription_items table to support multiple medicines per prescription
CREATE TABLE IF NOT EXISTS `prescription_items` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `prescription_id` int(11) NOT NULL,
  `medicine_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`item_id`),
  KEY `prescription_id` (`prescription_id`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `prescription_items_ibfk_1` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`prescription_id`) ON DELETE CASCADE,
  CONSTRAINT `prescription_items_ibfk_2` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`medicine_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Modify prescriptions table to remove medicine_id and quantity columns
ALTER TABLE `prescriptions` 
  DROP FOREIGN KEY `prescriptions_ibfk_3`;

ALTER TABLE `prescriptions` 
  DROP COLUMN `medicine_id`,
  DROP COLUMN `quantity`;

-- Migrate existing prescriptions to the new schema
-- This SQL should be run manually after creating the prescription_items table
-- INSERT INTO prescription_items (prescription_id, medicine_id, quantity)
-- SELECT prescription_id, medicine_id, quantity FROM prescriptions_backup;

sql
-- สร้างตาราง users
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` VARCHAR(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` VARCHAR(255) COLLATE utf8mb4_general_ci NOT NULL,
  `usertype` ENUM('entrepreneur','user') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'user',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_username` (`username`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_general_ci;

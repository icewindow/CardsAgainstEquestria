#CREATE DATABASE cae CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `permission` (
    `id` INT(10) AUTO_INCREMENT NOT NULL,
    `name` VARCHAR(256) NOT NULL,
    CONSTRAINT `permission_pkey` PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `user` (
    `id` INT(10) AUTO_INCREMENT NOT NULL,
    `name` VARCHAR(32) NOT NULL,
    `email` VARCHAR(256) NOT NULL,
    `password` VARCHAR(512) NOT NULL,
    `password_salt` VARCHAR(512) NOT NULL,
    `allow_emails` TINYINT DEFAULT 1 NOT NULL,
    `date_registered` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `last_login` TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT `user_pkey` PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `user_permissions` (
  `user_id` INT(10) NOT NULL,
  `permission_id` INT(10) NOT NULL,
  CONSTRAINT `user_permissions_pkey` PRIMARY KEY (`user_id`, `permission_id`),
  CONSTRAINT `user_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permission`(`id`),
  CONSTRAINT `user_permissions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
);

INSERT INTO permission (id, name) VALUES (1, 'admin');

GRANT ALL PRIVILEGES ON `cae`.* TO "cae"@"%";
FLUSH PRIVILEGES;
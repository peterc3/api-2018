CREATE TABLE `job_applications` (
  `app_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recruiter_id` INT UNSIGNED NOT NULL,
  `applicant_id` INT UNSIGNED NOT NULL,
  `comments` VARCHAR(255) NOT NULL,
  `favorite` TINYINT(1) UNSIGNED NOT NULL,
  `created` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`app_id`),
  CONSTRAINT `fk_applications_recruiters_id`
    FOREIGN KEY (`recruiter_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_applications_applicant_id`
    FOREIGN KEY (`applicant_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);
